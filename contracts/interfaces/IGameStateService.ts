/**
 * WHAT: Interface for the Game State Service.
 * WHY: To define the operations available for managing the game lifecycle.
 * HOW: All methods return Observables or Promises to handle async nature of state updates.
 */

import { Observable } from 'rxjs';
import { GameRoom, GameStep, SpicyLevel } from '../types/Game';

export interface IGameStateService {
  /**
   * The current state of the game room.
   */
  gameState$: Observable<GameRoom | null>;

  /**
   * Creates a new game room.
   * @param hostName The display name of the host.
   * @returns The created GameRoom.
   */
  createRoom(hostName: string): Promise<GameRoom>;

  /**
   * Joins an existing game room.
   * @param roomCode The 6-character room code.
   * @param playerName The display name of the player.
   * @returns The joined GameRoom.
   */
  joinRoom(roomCode: string, playerName: string): Promise<GameRoom>;

  /**
   * Updates the game step (e.g., moving from Lobby to CategorySelection).
   * @param roomCode The room code.
   * @param step The new step.
   */
  updateStep(roomCode: string, step: GameStep): Promise<void>;

  /**
   * Sets the spicy level for the game.
   * @param roomCode The room code.
   * @param level The selected spicy level.
   */
  setSpicyLevel(roomCode: string, level: SpicyLevel): Promise<void>;

  /**
   * Submits an answer for the current question.
   * @param roomCode The room code.
   * @param playerId The player ID.
   * @param text The answer text.
   */
  submitAnswer(roomCode: string, playerId: string, text: string): Promise<void>;

  /**
   * Sets the selected categories for question generation.
   * @param roomCode The room code.
   * @param categories The selected categories.
   */
  setCategories(roomCode: string, categories: string[]): Promise<void>;

  /**
   * Generates the next AI question for the room.
   * @param roomCode The room code.
   * @returns The generated Question.
   */
  generateNextQuestion(roomCode: string): Promise<import('../types/Game').Question>;

  /**
   * Gets all Q&A pairs for summary generation.
   * @param roomCode The room code.
   * @returns Array of question/answers pairs.
   */
  getQAPairs(roomCode: string): { question: string; answers: string[] }[];
}
