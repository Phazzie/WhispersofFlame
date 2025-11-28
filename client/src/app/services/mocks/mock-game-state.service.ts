import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { GameRoom, GameStep, SpicyLevel, Question } from '@contracts/types/Game';

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

    // Only allow joins during Lobby phase (CCR parity with real service)
    if (room.step !== 'Lobby') {
      throw new Error('Game already in progress');
    }

    // Check room capacity (max 4 players)
    if (room.players.length >= 4) {
      throw new Error('Room is full');
    }

    // Prevent duplicate names (case-insensitive)
    const nameTaken = room.players.some(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (nameTaken) {
      throw new Error('Name already taken in this room');
    }

    const newPlayer = { id: `player-${room.players.length + 1}`, name: playerName, isHost: false, isReady: false };
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

  async submitAnswer(_roomCode: string, _playerId: string, _text: string): Promise<void> {
    void _roomCode;
    void _playerId;
    void _text;
    // In a real app, we'd update the game state here
    // For mock, we just resolve
  }

  async setCategories(roomCode: string, categories: string[]): Promise<void> {
    void roomCode;
    const room = this._gameState.value;
    if (room) this._gameState.next({ ...room, categories });
  }

  async generateNextQuestion(roomCode: string): Promise<Question> {
    void roomCode;
    const question: Question = {
      id: 'mock-question-id',
      text: 'What is one thing you appreciate about your partner that you rarely say out loud?',
      category: 'Connection',
      spicyLevel: 'Mild'
    };
    const room = this._gameState.value;
    if (room) this._gameState.next({ ...room, currentQuestion: question });
    return question;
  }

  getQAPairs(roomCode: string): { question: string; answers: string[] }[] {
    void roomCode;
    // Return mock Q&A pairs for testing
    return [
      {
        question: 'What is one thing you appreciate about your partner?',
        answers: ['Their kindness', 'Their sense of humor']
      }
    ];
  }
}
