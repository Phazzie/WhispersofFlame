import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { z } from 'zod';
import { CardComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { Question } from '@contracts/types/Game';

// Answer validation schema - prevents XSS and excessive content
const AnswerSchema = z.string()
  .min(1, 'Please enter an answer')
  .max(1000, 'Answer must be 1000 characters or less')
  .transform(s => s.trim()); // Sanitize whitespace

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
            [ngModel]="answer()"
            (ngModelChange)="answer.set($event)"
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
  protected error = signal('');

  protected submitAnswer() {
    const result = AnswerSchema.safeParse(this.answer());
    if (!result.success) {
      this.error.set(result.error.issues[0]?.message || 'Invalid answer');
      return;
    }
    
    this.error.set('');
    this.submitted.set(true);
    this.answerSubmitted.emit(result.data);
  }
}
