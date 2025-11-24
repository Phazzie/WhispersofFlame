import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IAuthService } from '@contracts/interfaces/IAuthService';
import { AuthState, UserProfile } from '@contracts/types/User';

@Injectable()
export class MockAuthService implements IAuthService {
  private _authState = new BehaviorSubject<AuthState>({ isAuthenticated: false });
  authState$ = this._authState.asObservable();

  async loginAnonymously(displayName: string): Promise<UserProfile> {
    if (!displayName) throw new Error('Display name required');
    const user: UserProfile = {
      id: 'mock-user-id',
      displayName,
      createdAt: Date.now()
    };
    this._authState.next({ isAuthenticated: true, user, token: 'mock-token' });
    return user;
  }

  async logout(): Promise<void> {
    this._authState.next({ isAuthenticated: false });
  }

  async checkSession(): Promise<boolean> {
    return this._authState.value.isAuthenticated;
  }
}
