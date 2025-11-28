import { TestBed } from '@angular/core/testing';
import { RealGameStateService } from './real-game-state.service';
import { runGameStateServiceTests } from './game-state.contract';
import { AI_SERVICE } from '../tokens';
import { MockAIService } from './mocks/mock-ai.service';

describe('RealGameStateService', () => {
  runGameStateServiceTests(() => {
    TestBed.configureTestingModule({
      providers: [
        RealGameStateService,
        { provide: AI_SERVICE, useClass: MockAIService }
      ]
    });
    return TestBed.inject(RealGameStateService);
  });
});
