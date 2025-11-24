import { TestBed } from '@angular/core/testing';
import { RealAuthService } from './real-auth.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import netlifyIdentity from 'netlify-identity-widget';
import { NgZone } from '@angular/core';

// Mock Netlify Identity Widget
vi.mock('netlify-identity-widget', () => {
  return {
    default: {
      init: vi.fn(),
      on: vi.fn(),
      open: vi.fn(),
      close: vi.fn(),
      currentUser: vi.fn(),
      logout: vi.fn(),
    }
  };
});

describe('RealAuthService', () => {
  let service: RealAuthService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset mocks
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RealAuthService,
        {
          provide: NgZone,
          useValue: { run: <T>(fn: () => T) => fn() }
        }
      ]
    });
    service = TestBed.inject(RealAuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(netlifyIdentity.init).toHaveBeenCalled();
  });

  describe('loginAnonymously', () => {
    it('should create a guest session and persist to localStorage', async () => {
      const user = await service.loginAnonymously('GuestUser');
      
      expect(user.displayName).toBe('GuestUser');
      expect(user.id).toBeDefined();
      
      // Check localStorage
      const stored = localStorage.getItem('wof_guest_user');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!).displayName).toBe('GuestUser');
    });
  });

  describe('checkSession', () => {
    it('should return false if no user is logged in', async () => {
      vi.mocked(netlifyIdentity.currentUser).mockReturnValue(null);
      const result = await service.checkSession();
      expect(result).toBe(false);
    });

    it('should return true if Netlify user exists', async () => {
      const mockNetlifyUser = {
        id: 'net-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        user_metadata: { full_name: 'Netlify User' },
        token: { access_token: 'abc-123' },
        app_metadata: {},
        aud: '',
        confirmed_at: '',
        role: ''
      } as unknown as netlifyIdentity.User;
      
      vi.mocked(netlifyIdentity.currentUser).mockReturnValue(mockNetlifyUser);

      const result = await service.checkSession();
      expect(result).toBe(true);
      
      // Verify auth state was updated
      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBe(true);
        expect(state.user?.displayName).toBe('Netlify User');
      });
    });

    it('should return true if Guest user exists in localStorage', async () => {
      vi.mocked(netlifyIdentity.currentUser).mockReturnValue(null);
      
      const guestUser = {
        id: 'guest-123',
        displayName: 'Stored Guest',
        createdAt: Date.now()
      };
      localStorage.setItem('wof_guest_user', JSON.stringify(guestUser));

      const result = await service.checkSession();
      expect(result).toBe(true);

      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBe(true);
        expect(state.user?.displayName).toBe('Stored Guest');
      });
    });
  });
});
