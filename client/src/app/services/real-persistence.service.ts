import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';
import { GameRoom } from '@contracts/types/Game';

/**
 * WHAT: Real persistence service using Neon database via Netlify Functions
 * WHY: Enable multi-device gameplay with cloud sync
 * HOW: Call Netlify Functions that interact with PostgreSQL
 */

@Injectable({
  providedIn: 'root'
})
export class RealPersistenceService implements IPersistenceService {
  private readonly apiBase = '/.netlify/functions';

  constructor(private http: HttpClient) {}

  async saveGame(room: GameRoom): Promise<void> {
    // Update room state in database
    await firstValueFrom(
      this.http.post(`${this.apiBase}/room-update`, {
        roomCode: room.code,
        step: room.step,
        spicyLevel: room.spicyLevel,
        categories: room.categories
      })
    );
  }

  async getGame(roomCode: string): Promise<GameRoom | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<GameRoom>(`${this.apiBase}/room-get?code=${roomCode}`)
      );
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteGame(roomCode: string): Promise<void> {
    // Rooms auto-expire in database; this is a no-op for now
    // Could implement soft delete if needed
    console.log(`Room ${roomCode} will auto-expire after 24 hours`);
  }
}
