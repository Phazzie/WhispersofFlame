/**
 * WHAT: Core domain types for the Game.
 * WHY: To ensure a shared vocabulary across Client, API, and AI services.
 * HOW: Defined as pure TypeScript types/interfaces (no classes).
 */

export type SpicyLevel = 'Mild' | 'Medium' | 'Hot' | 'Extra-Hot';

export type GameStep = 'Lobby' | 'CategorySelection' | 'SpicyLevel' | 'Question' | 'Reveal' | 'Summary';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatarUrl?: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  spicyLevel: SpicyLevel;
}

export interface Answer {
  questionId: string;
  playerId: string;
  text: string;
  timestamp: number;
}

export interface GameRoom {
  code: string;
  hostId: string;
  players: Player[];
  step: GameStep;
  spicyLevel: SpicyLevel;
  categories: string[];
  currentQuestion?: Question;
  answers: Answer[]; // Cleared after each round or kept for summary? Kept for summary.
  createdAt: number;
  expiresAt: number;
}
