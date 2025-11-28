import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { GameRoom, GameStep, SpicyLevel, Question } from '@contracts/types/Game';
import { AI_SERVICE } from '../tokens';

/**
 * WHAT: Real implementation of IGameStateService for production
 * WHY: Manages game lifecycle with in-memory state (privacy-first, no persistence)
 * HOW: Uses AI service for question generation, tracks all Q&A for summary
 */
@Injectable({
  providedIn: 'root'
})
export class RealGameStateService implements IGameStateService {
  private aiService = inject(AI_SERVICE);

  private _gameState = new BehaviorSubject<GameRoom | null>(null);
  gameState$ = this._gameState.asObservable();
  private rooms = new Map<string, GameRoom>();

  // Track questions asked to avoid repeats and for summary
  private questionsAsked = new Map<string, Question[]>();

  async createRoom(hostName: string): Promise<GameRoom> {
    const code = this.generateRoomCode();
    const hostId = crypto.randomUUID();
    const room: GameRoom = {
      code,
      hostId,
      players: [{ id: hostId, name: hostName, isHost: true, isReady: false }],
      step: 'Lobby',
      spicyLevel: 'Mild',
      categories: [],
      answers: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000
    };

    this.rooms.set(code, room);
    this.questionsAsked.set(code, []);
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

  async setCategories(roomCode: string, categories: string[]): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');

    const updatedRoom = { ...room, categories };
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

  async generateNextQuestion(roomCode: string): Promise<Question> {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');

    // Get previously asked questions to avoid repeats
    const previousQuestions = this.questionsAsked.get(roomCode) || [];
    const previousTexts = previousQuestions.map(q => q.text);

    // Use selected categories or default
    const categories = room.categories.length > 0
      ? room.categories
      : ['Connection'];

    // Pick a random category for this question
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Generate question from AI
    const aiResponse = await this.aiService.generateQuestion(
      categories,
      room.spicyLevel,
      previousTexts
    );

    const question: Question = {
      id: crypto.randomUUID(),
      text: aiResponse.text,
      category,
      spicyLevel: room.spicyLevel
    };

    // Track this question
    previousQuestions.push(question);
    this.questionsAsked.set(roomCode, previousQuestions);

    // Update room with current question
    const updatedRoom = { ...room, currentQuestion: question };
    this.rooms.set(roomCode, updatedRoom);
    this._gameState.next(updatedRoom);

    return question;
  }

  async submitAnswer(roomCode: string, playerId: string, text: string): Promise<void> {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');
    if (!room.currentQuestion) throw new Error('No current question');

    const answer = {
      questionId: room.currentQuestion.id,
      playerId,
      text,
      timestamp: Date.now()
    };
    const updatedRoom = { ...room, answers: [...room.answers, answer] };

    this.rooms.set(roomCode, updatedRoom);
    this._gameState.next(updatedRoom);
  }

  getQAPairs(roomCode: string): { question: string; answers: string[] }[] {
    const room = this.rooms.get(roomCode);
    const questions = this.questionsAsked.get(roomCode) || [];
    if (!room) return [];

    // Build Q&A pairs by matching questions to answers
    const result: { question: string; answers: string[] }[] = [];

    for (const question of questions) {
      const answersForQuestion = room.answers
        .filter(a => a.questionId === question.id)
        .map(a => a.text);

      if (answersForQuestion.length > 0) {
        result.push({
          question: question.text,
          answers: answersForQuestion
        });
      }
    }

    return result;
  }

  private generateRoomCode(): string {
    // Generate 6-character alphanumeric code (letters only for readability)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluded I and O to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
