import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { GameRoom, GameStep, SpicyLevel, Question } from '@contracts/types/Game';

/**
 * WHAT: Mock implementation of IGameStateService for testing
 * WHY: Enables fast, predictable unit tests without external dependencies
 * HOW: In-memory state with fixed values for deterministic testing
 */
@Injectable()
export class MockGameStateService implements IGameStateService {
  private _gameState = new BehaviorSubject<GameRoom | null>(null);
  gameState$ = this._gameState.asObservable();
  private questionCount = 0;

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
    void roomCode;
    const room = this._gameState.value;
    if (room) this._gameState.next({ ...room, step });
  }

  async setCategories(roomCode: string, categories: string[]): Promise<void> {
    void roomCode;
    const room = this._gameState.value;
    if (room) this._gameState.next({ ...room, categories });
  }

  async setSpicyLevel(roomCode: string, level: SpicyLevel): Promise<void> {
    void roomCode;
    const room = this._gameState.value;
    if (room) this._gameState.next({ ...room, spicyLevel: level });
  }

  async generateNextQuestion(roomCode: string): Promise<Question> {
    void roomCode;
    const room = this._gameState.value;
    if (!room) throw new Error('No active room in mock');

    this.questionCount++;
    const category = room.categories[0] || 'Connection';
    const question: Question = {
      id: `mock-q-${this.questionCount}`,
      text: `Mock question ${this.questionCount} about ${category}?`,
      category,
      spicyLevel: room.spicyLevel
    };

    this._gameState.next({ ...room, currentQuestion: question });
    return question;
  }

  async submitAnswer(roomCode: string, playerId: string, text: string): Promise<void> {
    void roomCode;
    const room = this._gameState.value;
    if (!room || !room.currentQuestion) return;

    const answer = {
      questionId: room.currentQuestion.id,
      playerId,
      text,
      timestamp: Date.now()
    };
    this._gameState.next({ ...room, answers: [...room.answers, answer] });
  }

  getQAPairs(roomCode: string): { question: string; answers: string[] }[] {
    void roomCode;
    const room = this._gameState.value;
    if (!room) return [];

    // Group answers by questionId
    const qaPairs = new Map<string, { question: string; answers: string[] }>();

    for (const answer of room.answers) {
      const existing = qaPairs.get(answer.questionId);
      if (existing) {
        existing.answers.push(answer.text);
      } else {
        // For mock, we create a placeholder question text
        qaPairs.set(answer.questionId, {
          question: `Question ${answer.questionId}`,
          answers: [answer.text]
        });
      }
    }

    return Array.from(qaPairs.values());
  }
}
