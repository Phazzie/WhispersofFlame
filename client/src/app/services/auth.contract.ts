import { IAuthService } from '@contracts/interfaces/IAuthService';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

export function runAuthServiceTests(createService: () => IAuthService, setup?: () => Promise<void>, teardown?: () => Promise<void>) {
  describe('IAuthService Contract', () => {
    let service: IAuthService;

    beforeEach(async () => {
      if (setup) await setup();
      service = createService();
    });

    afterEach(async () => {
      if (teardown) await teardown();
    });

    describe('loginAnonymously', () => {
      it('should return a user profile with the given display name', async () => {
        const displayName = 'TestUser';
        const user = await service.loginAnonymously(displayName);
        
        expect(user).toBeDefined();
        expect(user.displayName).toBe(displayName);
        expect(user.id).toBeDefined();
        expect(user.createdAt).toBeDefined();
      });

      it('should update authState$ after login', async () => {
        await service.loginAnonymously('TestUser');
        const state = await firstValueFrom(service.authState$);
        
        expect(state.isAuthenticated).toBe(true);
        expect(state.user?.displayName).toBe('TestUser');
      });

      it('should throw error for empty display name', async () => {
        await expect(service.loginAnonymously('')).rejects.toThrow('Display name required');
      });
    });

    describe('logout', () => {
      it('should clear the session and update authState$', async () => {
        await service.loginAnonymously('TestUser');
        await service.logout();
        
        const state = await firstValueFrom(service.authState$);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeUndefined();
      });
    });

    describe('checkSession', () => {
      it('should return false initially (or when cleared)', async () => {
        // Ensure we start clean
        await service.logout();
        const hasSession = await service.checkSession();
        expect(hasSession).toBe(false);
      });

      it('should return true after login', async () => {
        await service.loginAnonymously('TestUser');
        const hasSession = await service.checkSession();
        expect(hasSession).toBe(true);
      });
    });
  });
}
