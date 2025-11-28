import { IAIService } from '@contracts/interfaces/IAIService';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

export function runAIServiceTests(createService: () => IAIService, setup?: () => Promise<void>, teardown?: () => Promise<void>) {
  describe('IAIService Contract', () => {
    let service: IAIService;

    beforeEach(async () => {
      if (setup) await setup();
      service = createService();
    });

    afterEach(async () => {
      if (teardown) await teardown();
    });

    describe('generateQuestion', () => {
      it('should return a valid AIResponse with text and metadata', async () => {
        const response = await service.generateQuestion(['Intimacy'], 'Medium', []);
        
        expect(response).toBeDefined();
        expect(response.text).toBeDefined();
        expect(typeof response.text).toBe('string');
        expect(response.text.length).toBeGreaterThan(0);
        
        expect(response.metadata).toBeDefined();
        expect(response.metadata?.model).toBeDefined();
        expect(response.metadata?.latency).toBeDefined();
      });

      it('should handle empty previous questions', async () => {
        const response = await service.generateQuestion(['Intimacy'], 'Mild', []);
        expect(response.text).toBeDefined();
      });

      it('should respect spicy level in context (mock verification)', async () => {
        // Note: In a real LLM test we can't easily verify semantic content without another LLM,
        // but we can verify the service accepts the input without crashing.
        const response = await service.generateQuestion(['Intimacy'], 'Extra-Hot', []);
        expect(response.text).toBeDefined();
      });
    });

    describe('generateSummary', () => {
      it('should return a summary based on QA pairs', async () => {
        const qaPairs = [
          { question: 'What do you like?', answers: ['Everything'] }
        ];
        const response = await service.generateSummary(qaPairs);
        
        expect(response).toBeDefined();
        expect(response.text).toBeDefined();
        expect(response.text.length).toBeGreaterThan(0);
      });

      it('should handle empty QA pairs gracefully', async () => {
        const response = await service.generateSummary([]);
        expect(response.text).toBeDefined();
      });
    });

    describe('generateTherapistNotes', () => {
      it('should return notes based on QA pairs', async () => {
        const qaPairs = [
          { question: 'How do you feel?', answers: ['Good'] }
        ];
        const response = await service.generateTherapistNotes(qaPairs);
        
        expect(response).toBeDefined();
        expect(response.text).toBeDefined();
        expect(response.text.length).toBeGreaterThan(0);
      });
    });
  });
}
