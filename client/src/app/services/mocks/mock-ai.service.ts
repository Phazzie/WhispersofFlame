import { Injectable } from '@angular/core';
import { IAIService } from '@contracts/interfaces/IAIService';
import { AIResponse } from '@contracts/types/AI';
import { SpicyLevel } from '@contracts/types/Game';

@Injectable()
export class MockAIService implements IAIService {
  async generateQuestion(_categories: string[], _spicyLevel: SpicyLevel, _previousQuestions: string[]): Promise<AIResponse> {
    void _categories;
    void _spicyLevel;
    void _previousQuestions;
    return {
      text: 'Mock Question: What is your favorite color?',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }

  async generateSummary(_qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    void _qaPairs;
    return {
      text: 'Mock Summary: You both like blue.',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }

  async generateTherapistNotes(_qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    void _qaPairs;
    return {
      text: 'Mock Notes: Very interesting.',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }
}
