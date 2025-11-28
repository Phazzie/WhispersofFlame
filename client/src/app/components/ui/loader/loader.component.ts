import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center" [ngClass]="{'py-8': !inline}">
      <div 
        class="animate-spin rounded-full border-t-2 border-b-2 border-red-500"
        [ngClass]="{
          'h-6 w-6': size === 'sm',
          'h-10 w-10': size === 'md',
          'h-16 w-16': size === 'lg'
        }"
      ></div>
      @if (message) {
        <p class="mt-4 text-gray-400 text-sm">{{ message }}</p>
      }
    </div>
  `
})
export class LoaderComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message = '';
  @Input() inline = false;
}
