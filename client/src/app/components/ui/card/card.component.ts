import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      [ngClass]="{
        'p-4': padding === 'sm',
        'p-6': padding === 'md',
        'p-8': padding === 'lg'
      }"
    >
      @if (title) {
        <h2 class="text-2xl font-bold mb-4 text-white">{{ title }}</h2>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() title = '';
  @Input() padding: 'sm' | 'md' | 'lg' = 'lg';
}
