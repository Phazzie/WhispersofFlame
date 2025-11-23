import { Injectable } from '@angular/core';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';
import { GameRoom } from '@contracts/types/Game';

@Injectable()
export class MockPersistenceService implements IPersistenceService {
  private storage = new Map<string, GameRoom>();

  async saveGame(room: GameRoom): Promise<void> {
    this.storage.set(room.code, room);
  }

  async getGame(roomCode: string): Promise<GameRoom | null> {
    return this.storage.get(roomCode) || null;
  }

  async deleteGame(roomCode: string): Promise<void> {
    this.storage.delete(roomCode);
  }
}
