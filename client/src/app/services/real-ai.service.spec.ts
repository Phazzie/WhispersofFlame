import { TestBed } from '@angular/core/testing';
import { RealAIService } from './real-ai.service';
import { runAIServiceTests } from './ai.contract';

describe('RealAIService', () => {
  runAIServiceTests(() => {
    TestBed.configureTestingModule({
      providers: [RealAIService]
    });
    return TestBed.inject(RealAIService);
  });
});
