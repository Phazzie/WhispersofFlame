import { TestBed } from '@angular/core/testing';
import { RealPersistenceService } from './real-persistence.service';
import { runPersistenceServiceTests } from './persistence.contract';

describe('RealPersistenceService', () => {
  runPersistenceServiceTests(
    () => {
      TestBed.configureTestingModule({
        providers: [RealPersistenceService]
      });
      return TestBed.inject(RealPersistenceService);
    },
    async () => {
      sessionStorage.clear();
    },
    async () => {
      sessionStorage.clear();
    }
  );
});
