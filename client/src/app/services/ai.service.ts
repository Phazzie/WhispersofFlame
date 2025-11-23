import { Injectable } from '@angular/core';
import { IAIService } from '@contracts/interfaces/IAIService';
import { AIResponse } from '@contracts/types/AI';
import { SpicyLevel } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class AIService implements IAIService {
  async generateQuestion(categories: string[], spicyLevel: SpicyLevel, previousQuestions: string[]): Promise<AIResponse> {
    throw new Error('Method not implemented.');
  }

  async generateSummary(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    throw new Error('Method not implemented.');
  }

  async generateTherapistNotes(qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    throw new Error('Method not implemented.');
  }
}
