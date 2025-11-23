/**
 * WHAT: User domain types.
 * WHY: To manage identity and authentication state.
 * HOW: Separated from Game types to allow for future profile features.
 */

export interface UserProfile {
  id: string;
  email?: string; // Optional for anonymous/guest users
  displayName: string;
  createdAt: number;
  preferences?: {
    theme: 'light' | 'dark';
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
}
