import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LoaderComponent } from '../../ui/loader/loader.component';
import { Answer, Player } from '@contracts/types/Game';
import { AI_SERVICE, GAME_STATE_SERVICE } from '../../../tokens';

/**
 * WHAT: Game summary component showing session highlights and AI-generated insights
 * WHY: Provides couples with meaningful takeaways and encourages reflection
 * HOW: Displays stats, memorable moments, AI summary, and optional therapist notes
 */
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, LoaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Celebration Header -->
      <div class="text-center space-y-4">
        <div class="text-6xl">🔥✨🔥</div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Game Complete!
        </h1>
        <p class="text-gray-400">You shared {{ answers.length }} whispers tonight</p>
      </div>

      <!-- Stats Card -->
      <app-card title="Tonight's Journey">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="text-center p-4 bg-gray-700 rounded-lg">
            <p class="text-3xl font-bold text-red-500">{{ answers.length }}</p>
            <p class="text-sm text-gray-400">Answers Shared</p>
          </div>
          <div class="text-center p-4 bg-gray-700 rounded-lg">
            <p class="text-3xl font-bold text-orange-500">{{ players.length }}</p>
            <p class="text-sm text-gray-400">Players</p>
          </div>
        </div>
      </app-card>

      <!-- AI-Generated Summary -->
      <app-card title="Ember's Reflection 🔥">
        @if (loadingSummary()) {
          <div class="flex justify-center py-8">
            <app-loader size="md" message="Ember is reflecting on your session..."></app-loader>
          </div>
        } @else if (summaryText()) {
          <div class="prose prose-invert max-w-none">
            <p class="text-gray-200 whitespace-pre-line">{{ summaryText() }}</p>
          </div>
        } @else {
          <p class="text-gray-400 text-center py-4">
            Unable to generate summary. But the memories are yours forever! 💕
          </p>
        }
      </app-card>

      <!-- Dr. Ember's Notes (Optional) -->
      @if (showTherapistNotes()) {
        <app-card title="Dr. Ember's Notes 📝">
          @if (loadingNotes()) {
            <div class="flex justify-center py-8">
              <app-loader size="md" message="Dr. Ember is reviewing your session..."></app-loader>
            </div>
          } @else if (therapistNotes()) {
            <div class="prose prose-invert max-w-none">
              <p class="text-gray-200 whitespace-pre-line">{{ therapistNotes() }}</p>
            </div>
          }
        </app-card>
      } @else {
        <app-button variant="outline" (clicked)="requestTherapistNotes()">
          📝 Get Dr. Ember's Notes
        </app-button>
      }

      <!-- Memorable Moments -->
      @if (answers.length > 0) {
        <app-card title="Memorable Whispers 💕">
          <div class="space-y-4">
            @for (answer of getTopAnswers(); track answer.timestamp) {
              <div class="p-4 bg-gray-700 rounded-lg">
                <div class="flex items-center space-x-3 mb-2">
                  <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {{ getPlayerName(answer.playerId).charAt(0).toUpperCase() }}
                  </div>
                  <p class="font-medium text-red-400">{{ getPlayerName(answer.playerId) }}</p>
                </div>
                <p class="text-white italic">"{{ answer.text }}"</p>
              </div>
            }
          </div>
        </app-card>
      }

      <!-- Actions -->
      <div class="space-y-3">
        <app-button variant="primary" (clicked)="onPlayAgain()">
          🔥 Play Again
        </app-button>
        <app-button variant="outline" (clicked)="onGoHome()">
          Back to Lobby
        </app-button>
      </div>

      <!-- Footer -->
      <p class="text-center text-gray-500 text-xs">
        Thank you for playing Whispers of Flame 💕
      </p>
    </div>
  `
})
export class SummaryComponent implements OnInit {
  private aiService = inject(AI_SERVICE);
  private gameStateService = inject(GAME_STATE_SERVICE);

  @Input() answers: Answer[] = [];
  @Input() players: Player[] = [];
  @Input() roomCode = '';
  @Output() playAgain = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

  protected summaryText = signal('');
  protected therapistNotes = signal('');
  protected loadingSummary = signal(false);
  protected loadingNotes = signal(false);
  protected showTherapistNotes = signal(false);

  async ngOnInit() {
    await this.generateSummary();
  }

  private async generateSummary() {
    this.loadingSummary.set(true);
    try {
      // Get Q&A pairs from game state
      const qaPairs = this.gameStateService.getQAPairs(this.roomCode);

      if (qaPairs.length > 0) {
        const response = await this.aiService.generateSummary(qaPairs);
        this.summaryText.set(response.text);
      } else {
        // Fallback if no Q&A pairs available
        this.summaryText.set(
          "What a wonderful session! You've shared intimate moments and deepened your connection. " +
          "Keep nurturing this flame between you. 🔥"
        );
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      this.summaryText.set('');
    } finally {
      this.loadingSummary.set(false);
    }
  }

  protected async requestTherapistNotes() {
    this.showTherapistNotes.set(true);
    this.loadingNotes.set(true);
    try {
      const qaPairs = this.gameStateService.getQAPairs(this.roomCode);

      if (qaPairs.length > 0) {
        const response = await this.aiService.generateTherapistNotes(qaPairs);
        this.therapistNotes.set(response.text);
      } else {
        this.therapistNotes.set(
          "Based on tonight's session, I encourage you to continue exploring these conversations " +
          "in your daily life. Open communication is the foundation of intimacy."
        );
      }
    } catch (error) {
      console.error('Failed to generate therapist notes:', error);
      this.therapistNotes.set('');
    } finally {
      this.loadingNotes.set(false);
    }
  }

  protected getPlayerName(playerId: string): string {
    const player = this.players.find(p => p.id === playerId);
    return player?.name || 'Unknown';
  }

  protected getTopAnswers(): Answer[] {
    // Return up to 3 most recent answers as "memorable"
    return this.answers.slice(-3).reverse();
  }

  protected onPlayAgain() {
    this.playAgain.emit();
  }

  protected onGoHome() {
    this.goHome.emit();
  }
}
