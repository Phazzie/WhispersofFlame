import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Question } from '@contracts/types/Game';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <app-card>
      <div class="space-y-6">
        <!-- Question Display -->
        <div class="text-center space-y-4">
          <div class="text-4xl">🔥</div>
          <h2 class="text-2xl font-bold text-white leading-relaxed">
            {{ question?.text || 'Loading question...' }}
          </h2>
          @if (question?.category) {
            <span class="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
              {{ question?.category }}
            </span>
          }
        </div>

        <!-- Answer Input -->
        <div class="space-y-4">
          <textarea
            [(ngModel)]="answer"
            placeholder="Type your answer here..."
            rows="4"
            class="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 focus:border-red-500 focus:outline-none text-white placeholder-gray-400 resize-none"
            [disabled]="submitted()"
          ></textarea>

          @if (!submitted()) {
            <app-button 
              variant="primary" 
              [disabled]="!answer().trim()"
              (clicked)="submitAnswer()"
            >
              Submit Answer ✨
            </app-button>
          } @else {
            <div class="text-center p-4 bg-green-500/20 rounded-lg">
              <p class="text-green-400 font-medium">✓ Answer submitted!</p>
              <p class="text-gray-400 text-sm mt-1">Waiting for other players...</p>
            </div>
          }
        </div>
      </div>
    </app-card>
  `
})
export class QuestionComponent {
  @Input() question: Question | undefined;
  @Output() answerSubmitted = new EventEmitter<string>();

  protected answer = signal('');
  protected submitted = signal(false);

  protected submitAnswer() {
    if (this.answer().trim()) {
      this.submitted.set(true);
      this.answerSubmitted.emit(this.answer());
    }
  }
}
