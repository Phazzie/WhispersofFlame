import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Player } from '@contracts/types/Game';

/**
 * WHAT: Pass-the-phone transition screen for same-device gameplay
 * WHY: Enables couples to play on a single device by handing it between turns
 * HOW: Shows next player's name with a "Ready" button to prevent peeking
 */
@Component({
  selector: 'app-pass-phone',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <app-card>
      <div class="space-y-8 text-center py-8">
        <!-- Phone Icon Animation -->
        <div class="text-6xl animate-bounce">📱</div>
        
        <!-- Instruction -->
        <div class="space-y-2">
          <p class="text-gray-400 text-lg">Pass the phone to...</p>
          <h2 class="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            {{ nextPlayer?.name || 'Next Player' }}
          </h2>
        </div>
        
        <!-- Privacy Warning -->
        <div class="bg-gray-800 rounded-lg p-4 mx-4">
          <p class="text-gray-400 text-sm">
            🔒 {{ nextPlayer?.name }}, make sure {{ currentPlayer?.name }} isn't looking!
          </p>
        </div>
        
        <!-- Ready Button -->
        <div class="pt-4">
          <app-button variant="primary" (clicked)="onReady()">
            I'm {{ nextPlayer?.name }} - Ready! 🔥
          </app-button>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    .animate-bounce {
      animation: bounce 1s infinite;
    }
  `]
})
export class PassPhoneComponent {
  @Input() currentPlayer: Player | undefined;
  @Input() nextPlayer: Player | undefined;
  @Output() ready = new EventEmitter<void>();

  protected onReady() {
    this.ready.emit();
  }
}
