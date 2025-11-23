import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { MockAuthService } from './mocks/mock-auth.service';
import { AUTH_SERVICE } from './tokens';
import { IAuthService } from '@contracts/interfaces/IAuthService';

describe('AuthService', () => {
  let service: IAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AUTH_SERVICE, useClass: MockAuthService }
      ]
    });
    service = TestBed.inject(AUTH_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginAnonymously', () => {
    it('should return a user profile with the given display name', async () => {
      const user = await service.loginAnonymously('TestUser');
      expect(user).toBeDefined();
      expect(user.displayName).toBe('TestUser');
      expect(user.id).toBeDefined();
    });

    it('should throw error for empty display name', async () => {
      await expect(service.loginAnonymously('')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should clear the session', async () => {
      await service.loginAnonymously('TestUser');
      await service.logout();
      const isAuthenticated = await service.checkSession();
      expect(isAuthenticated).toBe(false);
    });
  });
});
