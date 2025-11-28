import { Injectable } from '@angular/core';
import { IAIService } from '@contracts/interfaces/IAIService';
import { AIResponse } from '@contracts/types/AI';
import { SpicyLevel } from '@contracts/types/Game';

@Injectable()
export class MockAIService implements IAIService {
  async generateQuestion(categories: string[], spicyLevel: SpicyLevel, previousQuestions: string[]): Promise<AIResponse> {
    void categories;
    void spicyLevel;
    void previousQuestions;
    
    return {
      text: 'Mock Question: What is one specific thing you like?',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }

  async generateSummary(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    void qaPairs;
    return {
      text: 'Mock Summary: Session was great.',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }

  async generateTherapistNotes(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    void qaPairs;
    return {
      text: 'Mock Notes: Good dynamic.',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }
}
