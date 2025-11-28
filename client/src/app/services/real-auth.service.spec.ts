import { TestBed } from '@angular/core/testing';
import { RealAuthService } from './real-auth.service';
import { vi, describe } from 'vitest';
import { NgZone } from '@angular/core';
import { runAuthServiceTests } from './auth.contract';

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
  runAuthServiceTests(
    () => TestBed.inject(RealAuthService),
    async () => {
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
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
    },
    async () => {
      localStorage.clear();
      sessionStorage.clear();
    }
  );
});
