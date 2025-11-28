import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Answer, Player, Question } from '@contracts/types/Game';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
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
export class SummaryComponent {
  @Input() answers: Answer[] = [];
  @Input() players: Player[] = [];
  @Output() playAgain = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

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
