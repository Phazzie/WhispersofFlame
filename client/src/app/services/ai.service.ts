import { Injectable } from '@angular/core';
import { IAIService } from '@contracts/interfaces/IAIService';
import { AIResponse } from '@contracts/types/AI';
import { SpicyLevel } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class AIService implements IAIService {
  async generateQuestion(_categories: string[], _spicyLevel: SpicyLevel, _previousQuestions: string[]): Promise<AIResponse> {
    void _categories;
    void _spicyLevel;
    void _previousQuestions;
    throw new Error('Method not implemented.');
  }

  async generateSummary(_qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    void _qaPairs;
    throw new Error('Method not implemented.');
  }

  async generateTherapistNotes(_qaPairs: { question: string; answers: string[] }[]): Promise<AIResponse> {
    void _qaPairs;
    throw new Error('Method not implemented.');
  }
}
