import { Injectable } from '@angular/core';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';
import { GameRoom } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService implements IPersistenceService {
  async saveGame(_room: GameRoom): Promise<void> {
    void _room;
    throw new Error('Method not implemented.');
  }

  async getGame(_roomCode: string): Promise<GameRoom | null> {
    void _roomCode;
    throw new Error('Method not implemented.');
  }

  async deleteGame(_roomCode: string): Promise<void> {
    void _roomCode;
    throw new Error('Method not implemented.');
  }
}
