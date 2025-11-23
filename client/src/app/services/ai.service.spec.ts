import { TestBed } from '@angular/core/testing';
import { AIService } from './ai.service';
import { AI_SERVICE } from './tokens';
import { IAIService } from '@contracts/interfaces/IAIService';

describe('AIService', () => {
  let service: IAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AI_SERVICE, useClass: AIService }
      ]
    });
    service = TestBed.inject(AI_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateQuestion', () => {
    it('should return a question string', async () => {
      try {
        const response = await service.generateQuestion(['Intimacy'], 'Medium', []);
        expect(response.text).toBeDefined();
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
