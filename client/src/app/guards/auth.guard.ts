/**
 * WHAT: Route guard that protects game routes from unauthenticated users
 * WHY: Ensures players are logged in before accessing game rooms
 * HOW: Checks auth state and redirects to lobby if not authenticated
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AUTH_SERVICE } from '../tokens';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AUTH_SERVICE);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(state => {
      if (state.isAuthenticated) {
        return true;
      }
      // Redirect to lobby if not authenticated
      router.navigate(['/']);
      return false;
    })
  );
};
