import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, BehaviorSubject, filter } from 'rxjs';

/**
 * WHAT: Real-time sync service for multi-device gameplay
 * WHY: Keep all players' devices in sync without WebSockets
 * HOW: Poll room-sync endpoint every 2 seconds for new events
 */

export interface GameEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export interface SyncResponse {
  events: GameEvent[];
  players: any[];
  serverTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class RealSyncService {
  private readonly apiBase = '/.netlify/functions';
  private syncInterval = 2000; // Poll every 2 seconds
  private lastSyncTime = new Date().toISOString();
  private activeRoomCode$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Start syncing a room - returns observable of events
   */
  startSync(roomCode: string): Observable<SyncResponse> {
    this.activeRoomCode$.next(roomCode);
    this.lastSyncTime = new Date().toISOString();

    return interval(this.syncInterval).pipe(
      filter(() => this.activeRoomCode$.value === roomCode),
      switchMap(() => this.fetchEvents(roomCode))
    );
  }

  /**
   * Stop syncing
   */
  stopSync(): void {
    this.activeRoomCode$.next(null);
  }

  /**
   * Manually fetch latest events
   */
  async fetchEventsOnce(roomCode: string): Promise<SyncResponse> {
    return this.fetchEvents(roomCode).toPromise() as Promise<SyncResponse>;
  }

  private fetchEvents(roomCode: string): Observable<SyncResponse> {
    const url = `${this.apiBase}/room-sync?code=${roomCode}&since=${this.lastSyncTime}`;

    return new Observable<SyncResponse>(observer => {
      this.http.get<SyncResponse>(url).subscribe({
        next: (response) => {
          // Update last sync time if we got events
          if (response.events.length > 0) {
            const latestEvent = response.events[response.events.length - 1];
            this.lastSyncTime = new Date(latestEvent.timestamp).toISOString();
          }
          observer.next(response);
        },
        error: (err) => {
          console.error('Sync error:', err);
          // Don't fail - just skip this poll
          observer.next({ events: [], players: [], serverTime: Date.now() });
        }
      });
    });
  }

  /**
   * Get current active room code
   */
  getActiveRoom(): string | null {
    return this.activeRoomCode$.value;
  }
}
