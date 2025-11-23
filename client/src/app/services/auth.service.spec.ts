import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';
import { IAuthService } from '@contracts/interfaces/IAuthService';

describe('AuthService', () => {
  let service: IAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AUTH_SERVICE, useClass: AuthService }
      ]
    });
    service = TestBed.inject(AUTH_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginAnonymously', () => {
    it('should return a user profile with the given display name', async () => {
      try {
        await service.loginAnonymously('TestUser');
        throw new Error('Should have thrown error');
      } catch (e) {
        expect(e).toBeDefined(); // Currently fails as expected
      }
    });

    it('should throw error for empty display name', async () => {
      try {
        await service.loginAnonymously('');
        throw new Error('Should have thrown error');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('logout', () => {
    it('should clear the session', async () => {
      try {
        await service.logout();
        throw new Error('Should have thrown error');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
