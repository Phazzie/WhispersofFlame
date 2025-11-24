/**
 * WHAT: Interface for the Persistence Service.
 * WHY: To abstract the database/storage layer.
 * HOW: Allows swapping between In-Memory (Mock), LocalStorage, or Backend DB.
 */

import { GameRoom } from '../types/Game';

export interface IPersistenceService {
  /**
   * Saves the game state.
   * @param room The game room object.
   */
  saveGame(room: GameRoom): Promise<void>;

  /**
   * Retrieves a game by its code.
   * @param roomCode The room code.
   */
  getGame(roomCode: string): Promise<GameRoom | null>;

  /**
   * Deletes a game (e.g., after expiration).
   * @param roomCode The room code.
   */
  deleteGame(roomCode: string): Promise<void>;
}
