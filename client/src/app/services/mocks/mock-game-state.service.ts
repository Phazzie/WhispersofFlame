import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { GameRoom, GameStep, SpicyLevel } from '@contracts/types/Game';

@Injectable()
export class MockGameStateService implements IGameStateService {
  private _gameState = new BehaviorSubject<GameRoom | null>(null);
  gameState$ = this._gameState.asObservable();

  async createRoom(hostName: string): Promise<GameRoom> {
    const room: GameRoom = {
      code: 'ABCDEF', // Fixed code for testing
      hostId: 'host-id',
      players: [{ id: 'host-id', name: hostName, isHost: true, isReady: false }],
      step: 'Lobby',
      spicyLevel: 'Mild',
      categories: [],
      answers: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000
    };
    this._gameState.next(room);
    return room;
  }

  async joinRoom(roomCode: string, playerName: string): Promise<GameRoom> {
    if (roomCode === 'INVALID') throw new Error('Room not found');
    const room = this._gameState.value;
    if (!room) throw new Error('No active room in mock');
    
    const newPlayer = { id: 'player-2', name: playerName, isHost: false, isReady: false };
    const updatedRoom = { ...room, players: [...room.players, newPlayer] };
    this._gameState.next(updatedRoom);
    return updatedRoom;
  }

  async updateStep(roomCode: string, step: GameStep): Promise<void> {
    const room = this._gameState.value;
    if (room) this._gameState.next({ ...room, step });
  }

  async setSpicyLevel(roomCode: string, level: SpicyLevel): Promise<void> {
    const room = this._gameState.value;
    if (room) this._gameState.next({ ...room, spicyLevel: level });
  }

  async submitAnswer(roomCode: string, playerId: string, text: string): Promise<void> {
    // Mock implementation
  }
}
