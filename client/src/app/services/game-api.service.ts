import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GameRoom, Player, Question, Answer, SpicyLevel, GameStep } from '@contracts/types/Game';

/**
 * WHAT: Centralized API service for all game operations
 * WHY: Single source of truth for backend communication
 * HOW: Wraps all Netlify Function calls with type-safe methods
 */

interface CreateRoomRequest {
  hostName: string;
  playMode?: 'multi-device' | 'same-device';
}

interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
}

interface UpdateRoomRequest {
  roomCode: string;
  step?: GameStep;
  spicyLevel?: SpicyLevel;
  categories?: string[];
}

interface PlayerReadyRequest {
  roomCode: string;
  playerId: string;
  isReady: boolean;
}

interface SubmitQuestionRequest {
  roomCode: string;
  text: string;
  category: string;
  spicyLevel: SpicyLevel;
}

interface SubmitAnswerRequest {
  roomCode: string;
  questionId: string;
  playerId: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameApiService {
  private readonly apiBase = '/.netlify/functions';

  constructor(private http: HttpClient) {}

  /**
   * Create a new game room
   */
  async createRoom(hostName: string, playMode: 'multi-device' | 'same-device' = 'multi-device'): Promise<GameRoom> {
    const request: CreateRoomRequest = { hostName, playMode };
    return firstValueFrom(
      this.http.post<GameRoom>(`${this.apiBase}/room-create`, request)
    );
  }

  /**
   * Join an existing room
   */
  async joinRoom(roomCode: string, playerName: string): Promise<GameRoom & { playerId: string }> {
    const request: JoinRoomRequest = { roomCode, playerName };
    return firstValueFrom(
      this.http.post<GameRoom & { playerId: string }>(`${this.apiBase}/room-join`, request)
    );
  }

  /**
   * Get current room state
   */
  async getRoom(roomCode: string): Promise<GameRoom | null> {
    try {
      return await firstValueFrom(
        this.http.get<GameRoom>(`${this.apiBase}/room-get?code=${roomCode}`)
      );
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update room state
   */
  async updateRoom(roomCode: string, updates: Partial<Pick<GameRoom, 'step' | 'spicyLevel' | 'categories'>>): Promise<void> {
    const request: UpdateRoomRequest = {
      roomCode,
      step: updates.step,
      spicyLevel: updates.spicyLevel,
      categories: updates.categories
    };
    await firstValueFrom(
      this.http.post(`${this.apiBase}/room-update`, request)
    );
  }

  /**
   * Toggle player ready status
   */
  async setPlayerReady(roomCode: string, playerId: string, isReady: boolean): Promise<{ allReady: boolean }> {
    const request: PlayerReadyRequest = { roomCode, playerId, isReady };
    return firstValueFrom(
      this.http.post<{ allReady: boolean }>(`${this.apiBase}/player-ready`, request)
    );
  }

  /**
   * Submit AI-generated question
   */
  async submitQuestion(roomCode: string, question: { text: string; category: string; spicyLevel: SpicyLevel }): Promise<Question> {
    const request: SubmitQuestionRequest = { roomCode, ...question };
    return firstValueFrom(
      this.http.post<Question>(`${this.apiBase}/question-submit`, request)
    );
  }

  /**
   * Submit player answer
   */
  async submitAnswer(roomCode: string, questionId: string, playerId: string, text: string): Promise<{ allAnswered: boolean }> {
    const request: SubmitAnswerRequest = { roomCode, questionId, playerId, text };
    return firstValueFrom(
      this.http.post<{ allAnswered: boolean }>(`${this.apiBase}/answer-submit`, request)
    );
  }

  /**
   * Get recent game events for sync
   */
  async getSyncEvents(roomCode: string, since?: string): Promise<any> {
    const url = since
      ? `${this.apiBase}/room-sync?code=${roomCode}&since=${since}`
      : `${this.apiBase}/room-sync?code=${roomCode}`;
    return firstValueFrom(this.http.get(url));
  }
}
