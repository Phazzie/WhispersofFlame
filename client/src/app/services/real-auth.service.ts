/**
 * WHAT: Real implementation of the Authentication Service using Netlify Identity.
 * WHY: To provide secure, persistent user authentication.
 * HOW: Wraps the netlify-identity-widget SDK (dynamically loaded).
 */
import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IAuthService } from '@contracts/interfaces/IAuthService';
import { AuthState, UserProfile } from '@contracts/types/User';
import { z } from 'zod';

// Interface for netlify-identity-widget module
interface NetlifyIdentityModule {
  init(): void;
  open(): void;
  close(): void;
  logout(): void;
  currentUser(): unknown;
  on(event: 'login' | 'logout', callback: (user?: unknown) => void): void;
}

// Zod Schema for runtime validation of Netlify User Data
const NetlifyUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  user_metadata: z.object({
    full_name: z.string().optional(),
  }).optional(),
  token: z.object({
    access_token: z.string(),
  }).optional(),
});

@Injectable({
  providedIn: 'root'
})
export class RealAuthService implements IAuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({ isAuthenticated: false });
  authState$ = this.authStateSubject.asObservable();
  private readonly GUEST_KEY = 'wof_guest_user';
  private netlifyIdentity: NetlifyIdentityModule | null = null;
  private initPromise: Promise<void> | null = null;

  private ngZone = inject(NgZone);

  constructor() {
    // Defer initialization - don't block initial load
    this.initPromise = this.initNetlifyIdentity();
  }

  private async initNetlifyIdentity(): Promise<void> {
    try {
      // Dynamic import to avoid bundling with initial chunk
      const netlifyIdentityModule = await import('netlify-identity-widget');
      this.netlifyIdentity = netlifyIdentityModule.default as unknown as NetlifyIdentityModule;
      
      this.netlifyIdentity.init();

      this.netlifyIdentity.on('login', (user: unknown) => {
        this.ngZone.run(() => {
          this.handleNetlifyLogin(user);
          this.netlifyIdentity?.close();
        });
      });

      this.netlifyIdentity.on('logout', () => {
        this.ngZone.run(() => {
          this.handleLogout();
        });
      });
    } catch (error) {
      console.warn('Netlify Identity not available:', error);
    }
  }

  private handleNetlifyLogin(user: unknown) {
    // Runtime validation using Zod
    const result = NetlifyUserSchema.safeParse(user);

    if (!result.success) {
      console.error('Netlify User Validation Failed:', result.error);
      return;
    }

    const validUser = result.data;

    const userProfile: UserProfile = {
      id: validUser.id,
      email: validUser.email,
      displayName: validUser.user_metadata?.full_name || validUser.email || 'User',
      createdAt: new Date(validUser.created_at).getTime(),
    };

    this.authStateSubject.next({
      isAuthenticated: true,
      user: userProfile,
      token: validUser.token?.access_token
    });

    // Clear any guest session
    sessionStorage.removeItem(this.GUEST_KEY);
  }

  private handleLogout() {
    this.authStateSubject.next({ isAuthenticated: false });
    sessionStorage.removeItem(this.GUEST_KEY);
  }

  async loginAnonymously(displayName: string): Promise<UserProfile> {
    if (!displayName) {
      throw new Error('Display name required');
    }

    const guestUser: UserProfile = {
      id: crypto.randomUUID(),
      displayName,
      createdAt: Date.now()
    };

    // Persist guest session (session-only)
    sessionStorage.setItem(this.GUEST_KEY, JSON.stringify(guestUser));

    this.authStateSubject.next({
      isAuthenticated: true,
      user: guestUser
    });

    return guestUser;
  }

  async logout(): Promise<void> {
    await this.initPromise; // Ensure initialized
    
    return new Promise((resolve) => {
      if (this.netlifyIdentity?.currentUser()) {
        this.netlifyIdentity.logout();
        resolve();
      } else {
        this.handleLogout();
        resolve();
      }
    });
  }

  async checkSession(): Promise<boolean> {
    await this.initPromise; // Ensure initialized
    
    // 1. Check Netlify
    const netlifyUser = this.netlifyIdentity?.currentUser();
    if (netlifyUser) {
      this.handleNetlifyLogin(netlifyUser);
      return true;
    }

    // 2. Check Guest Storage
    const storedGuest = sessionStorage.getItem(this.GUEST_KEY);
    if (storedGuest) {
      try {
        const guestUser = JSON.parse(storedGuest) as UserProfile;
        this.authStateSubject.next({
          isAuthenticated: true,
          user: guestUser
        });
        return true;
      } catch {
        sessionStorage.removeItem(this.GUEST_KEY);
      }
    }

    return false;
  }

  async openLoginModal(): Promise<void> {
    await this.initPromise; // Ensure initialized
    this.netlifyIdentity?.open();
  }
}
