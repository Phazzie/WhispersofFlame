import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { GameRoom, GameStep, SpicyLevel } from '@contracts/types/Game';

@Injectable({
  providedIn: 'root'
})
export class RealGameStateService implements IGameStateService {
  // In a real app, this would connect to Firebase/Supabase
  // For now, we'll use in-memory state to satisfy the contract
  // and allow for future integration.

  private _gameState = new BehaviorSubject<GameRoom | null>(null);
  gameState$ = this._gameState.asObservable();
  private rooms = new Map<string, GameRoom>();

  async createRoom(hostName: string): Promise<GameRoom> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: GameRoom = {
      code,
      hostId: crypto.randomUUID(),
      players: [{ id: crypto.randomUUID(), name: hostName, isHost: true, isReady: false }],
      step: 'Lobby',
      spicyLevel: 'Mild',
      categories: [],
      answers: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000
    };
    
    this.rooms.set(code, room);
    this._gameState.next(room);
    return room;
  }

  async joinRoom(roomCode: string, playerName: string): Promise<GameRoom> {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');

    const newPlayer = { id: crypto.randomUUID(), name: playerName, isHost: false, isReady: false };
    const updatedRoom = { ...room, players: [...room.players, newPlayer] };
    
    this.rooms.set(roomCode, updatedRoom);
    this._gameState.next(updatedRoom);
    return updatedRoom;
  }

  async updateStep(roomCode: string, step: GameStep): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');

    const updatedRoom = { ...room, step };
    this.rooms.set(roomCode, updatedRoom);
    this._gameState.next(updatedRoom);
  }

  async setSpicyLevel(roomCode: string, level: SpicyLevel): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');

    const updatedRoom = { ...room, spicyLevel: level };
    this.rooms.set(roomCode, updatedRoom);
    this._gameState.next(updatedRoom);
  }

  async submitAnswer(roomCode: string, playerId: string, text: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');

    const answer = { questionId: 'q1', playerId, text, timestamp: Date.now() };
    const updatedRoom = { ...room, answers: [...room.answers, answer] };
    
    this.rooms.set(roomCode, updatedRoom);
    this._gameState.next(updatedRoom);
  }
}
