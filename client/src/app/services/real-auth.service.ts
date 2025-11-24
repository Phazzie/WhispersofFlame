/**
 * WHAT: Real implementation of the Authentication Service using Netlify Identity.
 * WHY: To provide secure, persistent user authentication.
 * HOW: Wraps the netlify-identity-widget SDK.
 */
import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IAuthService } from '@contracts/interfaces/IAuthService';
import { AuthState, UserProfile } from '@contracts/types/User';
import netlifyIdentity from 'netlify-identity-widget';
import { z } from 'zod';

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

  private ngZone = inject(NgZone);

  constructor() {
    this.initNetlifyIdentity();
  }

  private initNetlifyIdentity() {
    netlifyIdentity.init();

    netlifyIdentity.on('login', (user) => {
      this.ngZone.run(() => {
        this.handleNetlifyLogin(user);
        netlifyIdentity.close();
      });
    });

    netlifyIdentity.on('logout', () => {
      this.ngZone.run(() => {
        this.handleLogout();
      });
    });
  }

  private handleNetlifyLogin(user: netlifyIdentity.User) {
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
    localStorage.removeItem(this.GUEST_KEY);
  }

  private handleLogout() {
    this.authStateSubject.next({ isAuthenticated: false });
    localStorage.removeItem(this.GUEST_KEY);
  }

  async loginAnonymously(displayName: string): Promise<UserProfile> {
    const guestUser: UserProfile = {
      id: crypto.randomUUID(),
      displayName,
      createdAt: Date.now()
    };

    // Persist guest session
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(guestUser));

    this.authStateSubject.next({
      isAuthenticated: true,
      user: guestUser
    });

    return guestUser;
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      if (netlifyIdentity.currentUser()) {
        netlifyIdentity.logout();
        resolve();
      } else {
        this.handleLogout();
        resolve();
      }
    });
  }

  async checkSession(): Promise<boolean> {
    // 1. Check Netlify
    const netlifyUser = netlifyIdentity.currentUser();
    if (netlifyUser) {
      this.handleNetlifyLogin(netlifyUser);
      return true;
    }

    // 2. Check Guest Storage
    const storedGuest = localStorage.getItem(this.GUEST_KEY);
    if (storedGuest) {
      try {
        const guestUser = JSON.parse(storedGuest) as UserProfile;
        this.authStateSubject.next({
          isAuthenticated: true,
          user: guestUser
        });
        return true;
      } catch {
        localStorage.removeItem(this.GUEST_KEY);
      }
    }

    return false;
  }

  openLoginModal() {
    netlifyIdentity.open();
  }
}
