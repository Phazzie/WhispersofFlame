import { Injectable } from '@angular/core';
import { IAIService } from '@contracts/interfaces/IAIService';
import { AIResponse } from '@contracts/types/AI';
import { SpicyLevel } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class RealAIService implements IAIService {
  // In a real implementation, this would call an API (e.g., OpenRouter/Grok)
  // For now, we'll simulate the network call to satisfy the contract
  // and allow for future integration.

  async generateQuestion(categories: string[], spicyLevel: SpicyLevel, previousQuestions: string[]): Promise<AIResponse> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 50));

    // In production, this would be the actual API call
    return {
      text: `[Real AI] Question about ${categories.join(', ')} at ${spicyLevel} level. (Prev: ${previousQuestions.length})`,
      metadata: {
        model: 'grok-beta',
        latency: 50
      }
    };
  }

  async generateSummary(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      text: `[Real AI] Summary of ${qaPairs.length} questions.`,
      metadata: {
        model: 'grok-beta',
        latency: 50
      }
    };
  }

  async generateTherapistNotes(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      text: `[Real AI] Therapist notes for ${qaPairs.length} interactions.`,
      metadata: {
        model: 'grok-beta',
        latency: 50
      }
    };
  }
}
