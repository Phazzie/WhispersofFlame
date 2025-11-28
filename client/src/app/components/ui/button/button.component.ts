import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
      class="w-full font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      [ngClass]="{
        'bg-red-600 hover:bg-red-700 text-white': variant === 'primary',
        'bg-gray-700 hover:bg-gray-600 text-white': variant === 'secondary',
        'bg-transparent border border-red-600 text-red-600 hover:bg-red-600/10': variant === 'outline'
      }"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();
}
