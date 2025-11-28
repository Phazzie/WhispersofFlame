import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Question, Answer, Player } from '@contracts/types/Game';

@Component({
  selector: 'app-reveal',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <app-card>
      <div class="space-y-6">
        <!-- Question Recap -->
        <div class="text-center space-y-2">
          <p class="text-gray-400 text-sm">The question was...</p>
          <h2 class="text-xl font-bold text-white">{{ question?.text }}</h2>
        </div>

        <!-- Answers Reveal -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-300">Your Answers:</h3>
          
          @for (answer of answers; track answer.playerId) {
            <div class="p-4 bg-gray-700 rounded-lg space-y-2 animate-fade-in">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-lg font-bold">
                  {{ getPlayerName(answer.playerId).charAt(0).toUpperCase() }}
                </div>
                <p class="font-medium text-red-400">{{ getPlayerName(answer.playerId) }}</p>
              </div>
              <p class="text-white pl-14">{{ answer.text }}</p>
            </div>
          }
        </div>

        <!-- Next Action -->
        <div class="pt-4 border-t border-gray-700">
          <app-button variant="primary" (clicked)="onNextRound()">
            Next Round 🔥
          </app-button>
        </div>
      </div>
    </app-card>
  `
})
export class RevealComponent {
  @Input() question: Question | undefined;
  @Input() answers: Answer[] = [];
  @Input() players: Player[] = [];
  @Output() nextRound = new EventEmitter<void>();

  protected getPlayerName(playerId: string): string {
    const player = this.players.find(p => p.id === playerId);
    return player?.name || 'Unknown';
  }

  protected onNextRound() {
    this.nextRound.emit();
  }
}
