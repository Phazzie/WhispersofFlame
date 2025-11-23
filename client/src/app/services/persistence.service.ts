import { Injectable } from '@angular/core';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';
import { GameRoom } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService implements IPersistenceService {
  async saveGame(room: GameRoom): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getGame(roomCode: string): Promise<GameRoom | null> {
    throw new Error('Method not implemented.');
  }

  async deleteGame(roomCode: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
