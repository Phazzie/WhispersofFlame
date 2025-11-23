import { Injectable } from '@angular/core';
import { IAIService } from '@contracts/interfaces/IAIService';
import { AIResponse } from '@contracts/types/AI';
import { SpicyLevel } from '@contracts/types/Game';

@Injectable()
export class MockAIService implements IAIService {
  async generateQuestion(categories: string[], spicyLevel: SpicyLevel, previousQuestions: string[]): Promise<AIResponse> {
    return {
      text: 'Mock Question: What is your favorite color?',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }

  async generateSummary(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    return {
      text: 'Mock Summary: You both like blue.',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }

  async generateTherapistNotes(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    return {
      text: 'Mock Notes: Very interesting.',
      metadata: { model: 'mock-grok', latency: 10 }
    };
  }
}
