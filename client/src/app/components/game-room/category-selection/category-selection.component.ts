import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-category-selection',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <app-card title="Choose Your Categories">
      <div class="space-y-6">
        <p class="text-gray-400 text-sm">Select 3-5 categories for tonight's adventure</p>
        
        <div class="grid grid-cols-2 gap-3">
          @for (category of categories; track category) {
            <button
              (click)="toggleCategory(category)"
              class="p-4 rounded-lg border-2 transition-all duration-200 text-left"
              [class.border-red-500]="isSelected(category)"
              [class.bg-red-500/20]="isSelected(category)"
              [class.border-gray-600]="!isSelected(category)"
              [class.bg-gray-700]="!isSelected(category)"
              [class.hover:border-gray-500]="!isSelected(category)"
            >
              <span class="text-2xl mb-2 block">{{ getCategoryEmoji(category) }}</span>
              <span class="font-medium">{{ category }}</span>
            </button>
          }
        </div>

        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-400">{{ selectedCategories().length }}/5 selected</p>
          <app-button 
            variant="primary" 
            [disabled]="selectedCategories().length < 3"
            (clicked)="confirm()"
          >
            Continue 🔥
          </app-button>
        </div>
      </div>
    </app-card>
  `
})
export class CategorySelectionComponent {
  @Input() categories: string[] = [];
  @Output() categoriesSelected = new EventEmitter<string[]>();

  protected selectedCategories = signal<string[]>([]);

  private categoryEmojis: Record<string, string> = {
    'Intimacy': '💕',
    'Dreams': '✨',
    'Fantasies': '🌙',
    'Romance': '💝',
    'Adventure': '🎢',
    'Communication': '💬',
    'Trust': '🤝',
    'Desires': '🔥'
  };

  protected getCategoryEmoji(category: string): string {
    return this.categoryEmojis[category] || '💫';
  }

  protected isSelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  protected toggleCategory(category: string) {
    const current = this.selectedCategories();
    if (current.includes(category)) {
      this.selectedCategories.set(current.filter(c => c !== category));
    } else if (current.length < 5) {
      this.selectedCategories.set([...current, category]);
    }
  }

  protected confirm() {
    if (this.selectedCategories().length >= 3) {
      this.categoriesSelected.emit(this.selectedCategories());
    }
  }
}
