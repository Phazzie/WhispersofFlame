import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IAIService } from '@contracts/interfaces/IAIService';
import { AIResponse } from '@contracts/types/AI';
import { SpicyLevel } from '@contracts/types/Game';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { buildEmberPrompt, EXAMPLE_QUESTIONS, EMBER_SUMMARY_PROMPT, DR_EMBER_PROMPT } from './ember-prompt';

/**
 * WHAT: Real AI service that calls xAI's Grok API
 * WHY: Generates dynamic, personalized intimacy questions via grok-4-1-fast-reasoning
 * HOW: Makes HTTP calls to https://api.x.ai/v1/chat/completions with Ember persona from aiguidence.md
 */
@Injectable({
  providedIn: 'root'
})
export class RealAIService implements IAIService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.xai.baseUrl}/chat/completions`;
  private readonly model = environment.xai.model;

  /**
   * Generates an intimacy question based on categories and spicy level
   */
  async generateQuestion(
    categories: string[],
    spicyLevel: SpicyLevel,
    previousQuestions: string[]
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Use the full Ember prompt from aiguidence.md
    const systemPrompt = buildEmberPrompt(spicyLevel);
    const userPrompt = this.buildQuestionPrompt(categories, spicyLevel, previousQuestions);

    try {
      const response = await this.callXai(systemPrompt, userPrompt);
      return {
        text: response,
        metadata: {
          model: this.model,
          latency: Date.now() - startTime
        }
      };
    } catch {
      // Fallback to preset questions from aiguidence.md examples
      return this.getFallbackQuestion(spicyLevel, Date.now() - startTime);
    }
  }

  /**
   * Generates a summary of the game session
   */
  async generateSummary(
    qaPairs: { question: string; answers: string[] }[]
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Use Ember summary prompt from aiguidence.md
    const systemPrompt = EMBER_SUMMARY_PROMPT;

    const userPrompt = `Here are the questions and answers from their session:\n\n${
      qaPairs.map((qa, i) => 
        `Q${i + 1}: ${qa.question}\nAnswers: ${qa.answers.join(' | ')}`
      ).join('\n\n')
    }\n\nCreate a warm, insightful summary of this session.`;

    try {
      const response = await this.callXai(systemPrompt, userPrompt);
      return {
        text: response,
        metadata: {
          model: this.model,
          latency: Date.now() - startTime
        }
      };
    } catch {
      return {
        text: `What a beautiful session! You explored ${qaPairs.length} questions together, sharing moments of vulnerability and connection. Keep that spark alive! 🔥`,
        metadata: {
          model: 'fallback',
          latency: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Generates therapist-style notes about the session
   */
  async generateTherapistNotes(
    qaPairs: { question: string; answers: string[] }[]
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Use Dr. Ember prompt from aiguidence.md
    const systemPrompt = DR_EMBER_PROMPT;

    const userPrompt = `Session transcript:\n\n${
      qaPairs.map((qa, i) => 
        `Question ${i + 1}: ${qa.question}\nResponses: ${qa.answers.join(' | ')}`
      ).join('\n\n')
    }\n\nProvide therapeutic observations about this session.`;

    try {
      const response = await this.callXai(systemPrompt, userPrompt);
      return {
        text: response,
        metadata: {
          model: this.model,
          latency: Date.now() - startTime
        }
      };
    } catch {
      return {
        text: `You both showed wonderful openness in this session. The willingness to engage with ${qaPairs.length} questions demonstrates strong communication foundations. Continue exploring together! 💜`,
        metadata: {
          model: 'fallback',
          latency: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Makes the actual API call to xAI
   */
  private async callXai(systemPrompt: string, userPrompt: string): Promise<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.xai.apiKey}`
    });

    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 300
    };

    const response = await firstValueFrom(
      this.http.post<{ choices: { message: { content: string } }[] }>(
        this.apiUrl,
        body,
        { headers }
      )
    );

    return response.choices[0]?.message?.content?.trim() || '';
  }

  /**
   * Builds the user prompt for question generation
   */
  private buildQuestionPrompt(
    categories: string[],
    spicyLevel: SpicyLevel,
    previousQuestions: string[]
  ): string {
    let prompt = `Generate one intimacy question for a couple.

Categories to focus on: ${categories.join(', ')}
Spicy level: ${spicyLevel}`;

    if (previousQuestions.length > 0) {
      prompt += `\n\nQuestions already asked (avoid repeating themes):\n${
        previousQuestions.slice(-5).map((q, i) => `${i + 1}. ${q}`).join('\n')
      }`;
    }

    prompt += `\n\nGenerate a fresh, specific question that makes them lean in and think.`;

    return prompt;
  }

  /**
   * Returns a fallback question if API fails
   * Uses example questions from aiguidence.md
   */
  private getFallbackQuestion(
    spicyLevel: SpicyLevel,
    latency: number
  ): AIResponse {
    // Get questions from the centralized EXAMPLE_QUESTIONS (from aiguidence.md)
    const levelQuestions = EXAMPLE_QUESTIONS[spicyLevel]?.['couples'] || [];
    
    if (levelQuestions.length === 0) {
      return {
        text: "What's one thing about your partner that always catches your attention?",
        metadata: { model: 'fallback', latency }
      };
    }

    const randomQuestion = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];

    return {
      text: randomQuestion,
      metadata: {
        model: 'fallback',
        latency
      }
    };
  }
}
