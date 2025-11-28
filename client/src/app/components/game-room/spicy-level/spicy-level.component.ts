import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-spicy-level',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <app-card title="How Spicy? 🌶️">
      <div class="space-y-6">
        <p class="text-gray-400 text-sm text-center">Set the heat level for your questions</p>
        
        <div class="space-y-3">
          @for (level of levels; track level.value) {
            <button
              (click)="selectLevel(level.value)"
              class="w-full p-4 rounded-lg border-2 transition-all duration-200 text-left flex items-center space-x-4"
              [class.border-red-500]="selectedLevel() === level.value"
              [class.bg-red-500/20]="selectedLevel() === level.value"
              [class.border-gray-600]="selectedLevel() !== level.value"
              [class.bg-gray-700]="selectedLevel() !== level.value"
              [class.hover:border-gray-500]="selectedLevel() !== level.value"
            >
              <span class="text-3xl">{{ level.emoji }}</span>
              <div>
                <p class="font-bold text-lg">{{ level.value }}</p>
                <p class="text-sm text-gray-400">{{ level.description }}</p>
              </div>
            </button>
          }
        </div>

        <app-button 
          variant="primary" 
          [disabled]="!selectedLevel()"
          (clicked)="confirm()"
        >
          Let's Play! 🔥
        </app-button>
      </div>
    </app-card>
  `
})
export class SpicyLevelComponent {
  @Output() levelSelected = new EventEmitter<string>();

  protected selectedLevel = signal<string>('');

  protected levels = [
    { value: 'Mild', emoji: '🌶️', description: 'Sweet & romantic - perfect for warming up' },
    { value: 'Medium', emoji: '🌶️🌶️', description: 'Getting flirty - turn up the heat' },
    { value: 'Hot', emoji: '🌶️🌶️🌶️', description: 'Steamy territory - things are heating up' },
    { value: 'Extra-Hot', emoji: '🔥🔥🔥', description: 'No limits - pure fire' }
  ];

  protected selectLevel(level: string) {
    this.selectedLevel.set(level);
  }

  protected confirm() {
    if (this.selectedLevel()) {
      this.levelSelected.emit(this.selectedLevel());
    }
  }
}
