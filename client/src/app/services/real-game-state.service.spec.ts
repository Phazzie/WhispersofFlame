import { TestBed } from '@angular/core/testing';
import { RealGameStateService } from './real-game-state.service';
import { runGameStateServiceTests } from './game-state.contract';

describe('RealGameStateService', () => {
  runGameStateServiceTests(() => {
    TestBed.configureTestingModule({
      providers: [RealGameStateService]
    });
    return TestBed.inject(RealGameStateService);
  });
});
