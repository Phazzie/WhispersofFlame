/**
 * WHAT: Interface for the Authentication Service.
 * WHY: To manage user sessions and identity.
 * HOW: Supports both anonymous and authenticated flows.
 */

import { Observable } from 'rxjs';
import { AuthState, UserProfile } from '../types/User';

export interface IAuthService {
  /**
   * The current authentication state.
   */
  authState$: Observable<AuthState>;

  /**
   * Logs in anonymously (guest mode).
   * @param displayName The user's chosen name.
   */
  loginAnonymously(displayName: string): Promise<UserProfile>;

  /**
   * Logs out the current user.
   */
  logout(): Promise<void>;

  /**
   * Checks if a session is valid.
   */
  checkSession(): Promise<boolean>;
}
