/**
 * WHAT: AI Service types.
 * WHY: To strictly type the inputs and outputs of the LLM integration.
 * HOW: Decouples the application from the specific AI provider (Grok-4).
 */

import { SpicyLevel } from './Game';

export type AIPersona = 'Ember' | 'TheScribe' | 'DrEmber';

export interface PromptRequest {
  persona: AIPersona;
  context: {
    spicyLevel?: SpicyLevel;
    categories?: string[];
    previousQuestions?: string[];
    answers?: { question: string; answer: string }[];
    playerNames?: string[];
  };
}

export interface AIResponse {
  text: string;
  metadata?: {
    model: string;
    latency: number;
  };
}
