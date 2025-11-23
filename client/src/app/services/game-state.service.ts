import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { GameRoom, GameStep, SpicyLevel } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class GameStateService implements IGameStateService {
  gameState$: Observable<GameRoom | null> = of(null);

  async createRoom(hostName: string): Promise<GameRoom> {
    throw new Error('Method not implemented.');
  }

  async joinRoom(roomCode: string, playerName: string): Promise<GameRoom> {
    throw new Error('Method not implemented.');
  }

  async updateStep(roomCode: string, step: GameStep): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async setSpicyLevel(roomCode: string, level: SpicyLevel): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async submitAnswer(roomCode: string, playerId: string, text: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
