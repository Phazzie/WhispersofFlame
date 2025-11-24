/**
 * WHAT: Interface for the AI Service.
 * WHY: To abstract the complexity of LLM calls and prompt engineering.
 * HOW: Provides semantic methods rather than raw prompt endpoints.
 */

import { AIResponse } from '../types/AI';
import { SpicyLevel } from '../types/Game';

export interface IAIService {
  /**
   * Generates a question based on the current game context.
   * @param categories Selected categories.
   * @param spicyLevel Current spicy level.
   * @param previousQuestions List of previously asked questions to avoid repeats.
   */
  generateQuestion(
    categories: string[],
    spicyLevel: SpicyLevel,
    previousQuestions: string[]
  ): Promise<AIResponse>;

  /**
   * Generates a summary of the session.
   * @param qaPairs List of questions and answers from the session.
   */
  generateSummary(
    qaPairs: { question: string; answers: string[] }[]
  ): Promise<AIResponse>;

  /**
   * Generates therapist notes based on the session dynamics.
   * @param qaPairs List of questions and answers.
   */
  generateTherapistNotes(
    qaPairs: { question: string; answers: string[] }[]
  ): Promise<AIResponse>;
}
