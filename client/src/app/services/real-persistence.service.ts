import { Injectable } from '@angular/core';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';
import { GameRoom } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class RealPersistenceService implements IPersistenceService {
  // In a real app, this would use Firebase/Supabase
  // For now, we'll use sessionStorage to simulate persistence
  // that survives page reloads but not browser restarts (privacy first!)

  async saveGame(room: GameRoom): Promise<void> {
    sessionStorage.setItem(`wof_game_${room.code}`, JSON.stringify(room));
  }

  async getGame(roomCode: string): Promise<GameRoom | null> {
    const data = sessionStorage.getItem(`wof_game_${roomCode}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteGame(roomCode: string): Promise<void> {
    sessionStorage.removeItem(`wof_game_${roomCode}`);
  }
}
