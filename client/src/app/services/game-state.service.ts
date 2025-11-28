import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { GameRoom, GameStep, SpicyLevel, Question } from '@contracts/types/Game';

/**
 * WHAT: Stub implementation of IGameStateService
 * WHY: Placeholder that throws errors - forces use of Real or Mock implementation
 * HOW: All methods throw 'Method not implemented' - swap via DI tokens
 */
@Injectable({
  providedIn: 'root'
})
export class GameStateService implements IGameStateService {
  gameState$: Observable<GameRoom | null> = of(null);

  async createRoom(_hostName: string): Promise<GameRoom> {
    void _hostName;
    throw new Error('Method not implemented.');
  }

  async joinRoom(_roomCode: string, _playerName: string): Promise<GameRoom> {
    void _roomCode;
    void _playerName;
    throw new Error('Method not implemented.');
  }

  async updateStep(_roomCode: string, _step: GameStep): Promise<void> {
    void _roomCode;
    void _step;
    throw new Error('Method not implemented.');
  }

  async setCategories(_roomCode: string, _categories: string[]): Promise<void> {
    void _roomCode;
    void _categories;
    throw new Error('Method not implemented.');
  }

  async setSpicyLevel(_roomCode: string, _level: SpicyLevel): Promise<void> {
    void _roomCode;
    void _level;
    throw new Error('Method not implemented.');
  }

  async generateNextQuestion(_roomCode: string): Promise<Question> {
    void _roomCode;
    throw new Error('Method not implemented.');
  }

  async submitAnswer(_roomCode: string, _playerId: string, _text: string): Promise<void> {
    void _roomCode;
    void _playerId;
    void _text;
    throw new Error('Method not implemented.');
  }

  getQAPairs(_roomCode: string): { question: string; answers: string[] }[] {
    void _roomCode;
    throw new Error('Method not implemented.');
  }
}
