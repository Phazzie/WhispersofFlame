import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GAME_STATE_SERVICE } from '../../tokens';
import { GameRoom, SpicyLevel } from '@contracts/types/Game';
import { CardComponent } from '../ui/card/card.component';
import { ButtonComponent } from '../ui/button/button.component';
import { LoaderComponent } from '../ui/loader/loader.component';
import { CategorySelectionComponent } from './category-selection/category-selection.component';
import { SpicyLevelComponent } from './spicy-level/spicy-level.component';
import { QuestionComponent } from './question/question.component';
import { RevealComponent } from './reveal/reveal.component';
import { SummaryComponent } from './summary/summary.component';

/**
 * WHAT: Main game room orchestrator component
 * WHY: Manages game flow through all steps (Lobby → Categories → SpicyLevel → Question → Reveal → Summary)
 * HOW: Subscribes to game state and delegates to step-specific sub-components
 */
@Component({
  selector: 'app-game-room',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ButtonComponent,
    LoaderComponent,
    CategorySelectionComponent,
    SpicyLevelComponent,
    QuestionComponent,
    RevealComponent,
    SummaryComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      @if (loading()) {
        <div class="flex items-center justify-center min-h-screen">
          <app-loader size="lg" message="Loading game..."></app-loader>
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center min-h-screen">
          <app-card>
            <div class="text-center space-y-4">
              <div class="text-4xl">😢</div>
              <h2 class="text-xl font-bold text-red-500">{{ error() }}</h2>
              <app-button variant="secondary" (clicked)="goHome()">Back to Lobby</app-button>
            </div>
          </app-card>
        </div>
      } @else if (room()) {
        <!-- Header -->
        <div class="max-w-2xl mx-auto mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-white">🔥 Whispers of Flame</h1>
              <p class="text-gray-400 text-sm">Room: <span class="font-mono text-red-400">{{ room()?.code }}</span></p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-400">Players</p>
              <p class="text-lg font-bold">{{ room()?.players?.length || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Game Step Content -->
        <div class="max-w-2xl mx-auto">
          @switch (room()?.step) {
            @case ('Lobby') {
              <app-card title="Waiting for Players">
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    @for (player of room()?.players; track player.id) {
                      <div class="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
                        <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-lg font-bold">
                          {{ player.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-medium">{{ player.name }}</p>
                          @if (player.isHost) {
                            <span class="text-xs text-red-400">Host</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                  
                  @if (isHost()) {
                    <app-button variant="primary" [disabled]="(room()?.players?.length || 0) < 2" (clicked)="startGame()">
                      🎮 Start Game
                    </app-button>
                    @if ((room()?.players?.length || 0) < 2) {
                      <p class="text-center text-gray-400 text-sm">Need at least 2 players to start</p>
                    }
                  } @else {
                    <p class="text-center text-gray-400">Waiting for host to start...</p>
                  }
                </div>
              </app-card>
            }
            @case ('CategorySelection') {
              <app-category-selection 
                [categories]="availableCategories" 
                (categoriesSelected)="onCategoriesSelected($event)"
              ></app-category-selection>
            }
            @case ('SpicyLevel') {
              <app-spicy-level (levelSelected)="onSpicyLevelSelected($event)"></app-spicy-level>
            }
            @case ('Question') {
              <app-question 
                [question]="room()?.currentQuestion" 
                (answerSubmitted)="onAnswerSubmitted($event)"
              ></app-question>
            }
            @case ('Reveal') {
              <app-reveal 
                [question]="room()?.currentQuestion"
                [answers]="room()?.answers || []"
                [players]="room()?.players || []"
                (nextRound)="onNextRound()"
              ></app-reveal>
            }
            @case ('Summary') {
              <app-summary
                [answers]="room()?.answers || []"
                [players]="room()?.players || []"
                [roomCode]="room()?.code || ''"
                (playAgain)="onPlayAgain()"
                (goHome)="goHome()"
              ></app-summary>
            }
          }
        </div>
      }
    </div>
  `
})
export class GameRoomComponent implements OnInit, OnDestroy {
  private gameStateService = inject(GAME_STATE_SERVICE);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyed$ = new Subject<void>();

  protected room = signal<GameRoom | null>(null);
  protected loading = signal(true);
  protected error = signal('');
  protected currentPlayerId = signal('');

  // Round tracking for multiple questions (persisted in sessionStorage)
  private get roundCount(): number {
    return parseInt(sessionStorage.getItem('wof_roundCount') || '0', 10);
  }
  private set roundCount(value: number) {
    sessionStorage.setItem('wof_roundCount', value.toString());
  }
  private readonly maxRounds = 5;

  protected availableCategories = [
    'Intimacy', 'Dreams', 'Fantasies', 'Romance', 'Adventure', 'Communication', 'Trust', 'Desires'
  ];

  ngOnInit() {
    // Retrieve current player ID from session storage (set during lobby join/create)
    const storedPlayerId = sessionStorage.getItem('currentPlayerId');
    if (storedPlayerId) {
      this.currentPlayerId.set(storedPlayerId);
    }

    this.gameStateService.gameState$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(state => {
        if (state) {
          this.room.set(state);
          this.loading.set(false);

          // If player ID not set, try to find from room state
          if (!this.currentPlayerId() && state.players.length > 0) {
            // Only find player by stored name - don't guess by index (fragile)
            const storedName = sessionStorage.getItem('playerName');
            const player = storedName
              ? state.players.find(p => p.name === storedName)
              : undefined; // Avoid guessing by index, which is fragile
            if (player) {
              this.currentPlayerId.set(player.id);
              sessionStorage.setItem('currentPlayerId', player.id);
            }
          }
        }
      });

    // Check if we have a room in state, if not try to get from route
    const roomCode = this.route.snapshot.paramMap.get('code');
    if (roomCode && !this.room()) {
      this.error.set('Room not found. Please join from the lobby.');
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  protected isHost(): boolean {
    const room = this.room();
    if (!room) return false;
    const host = room.players.find(p => p.isHost);
    return host?.id === this.currentPlayerId();
  }

  protected async startGame() {
    const room = this.room();
    if (!room) return;
    await this.gameStateService.updateStep(room.code, 'CategorySelection');
  }

  protected async onCategoriesSelected(categories: string[]) {
    const room = this.room();
    if (!room) return;
    // Store categories in room state
    await this.gameStateService.setCategories(room.code, categories);
    await this.gameStateService.updateStep(room.code, 'SpicyLevel');
  }

  protected async onSpicyLevelSelected(level: string) {
    const room = this.room();
    if (!room) return;
    await this.gameStateService.setSpicyLevel(room.code, level as SpicyLevel);

    // Generate first question before transitioning to Question step
    this.roundCount = 1;
    await this.gameStateService.generateNextQuestion(room.code);
    await this.gameStateService.updateStep(room.code, 'Question');
  }

  protected async onAnswerSubmitted(answer: string) {
    const room = this.room();
    if (!room) return;
    await this.gameStateService.submitAnswer(room.code, this.currentPlayerId(), answer);
    // Check if all players answered, then move to reveal
    // For now, just move to reveal after submission
    await this.gameStateService.updateStep(room.code, 'Reveal');
  }

  protected async onNextRound() {
    const room = this.room();
    if (!room) return;

    this.roundCount++;

    // Check if we've reached max rounds
    if (this.roundCount > this.maxRounds) {
      await this.gameStateService.updateStep(room.code, 'Summary');
      return;
    }

    // Generate next question and go back to Question step
    await this.gameStateService.generateNextQuestion(room.code);
    await this.gameStateService.updateStep(room.code, 'Question');
  }

  protected async onPlayAgain() {
    const room = this.room();
    if (!room) return;
    // Reset round count and go back to category selection
    this.roundCount = 0;
    await this.gameStateService.updateStep(room.code, 'CategorySelection');
  }

  protected goHome() {
    // Clear session data including round count
    sessionStorage.removeItem('currentPlayerId');
    sessionStorage.removeItem('playerName');
    sessionStorage.removeItem('wof_roundCount');
    this.router.navigate(['/']);
  }
}
