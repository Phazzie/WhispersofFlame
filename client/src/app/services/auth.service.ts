import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IAuthService } from '@contracts/interfaces/IAuthService';
import { AuthState, UserProfile } from '@contracts/types/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IAuthService {
  authState$: Observable<AuthState> = of({ isAuthenticated: false });

  async loginAnonymously(_displayName: string): Promise<UserProfile> {
    void _displayName;
    throw new Error('Method not implemented.');
  }

  async logout(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async checkSession(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
