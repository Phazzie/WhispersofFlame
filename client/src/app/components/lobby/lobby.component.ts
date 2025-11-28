import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AUTH_SERVICE, GAME_STATE_SERVICE } from '../../tokens';
import { UserProfile } from '@contracts/types/User';
import { CardComponent } from '../ui/card/card.component';
import { ButtonComponent } from '../ui/button/button.component';
import { InputComponent } from '../ui/input/input.component';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🔥</div>
        <h1 class="text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Whispers of Flame
        </h1>
        <p class="text-gray-400 mt-2">Ignite your connection</p>
      </div>
      
      <div class="w-full max-w-md">
        <app-card>
          @if (!(authService.authState$ | async)?.isAuthenticated) {
            <div class="space-y-6">
              <div class="text-center">
                <h2 class="text-2xl font-semibold text-white">Welcome</h2>
                <p class="text-gray-400 text-sm mt-1">Enter your name to begin</p>
              </div>
              
              <app-input 
                label="Display Name" 
                placeholder="Enter your name"
                [ngModel]="displayName()"
                (ngModelChange)="displayName.set($event)"
              ></app-input>
              
              <app-button 
                variant="primary" 
                [disabled]="!displayName()"
                (clicked)="login()"
              >
                🔥 Enter the Flame
              </app-button>
            </div>
          }

          @if ((authService.authState$ | async)?.isAuthenticated) {
            <div class="space-y-6">
              <div class="text-center">
                <h2 class="text-2xl font-semibold text-white">
                  Hello, {{ (authService.authState$ | async)?.user?.displayName }}
                </h2>
                <p class="text-gray-400 text-sm mt-1">Ready to play?</p>
              </div>
              
              <app-button variant="primary" (clicked)="createRoom()">
                🎮 Create Room
              </app-button>
              
              <!-- Divider -->
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-gray-800 text-gray-400">or join existing</span>
                </div>
              </div>

              <div class="flex space-x-2">
                <div class="flex-1">
                  <input 
                    type="text" 
                    [ngModel]="roomCode()"
                    (ngModelChange)="roomCode.set($event.toUpperCase())"
                    class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-red-500 focus:outline-none text-white uppercase tracking-widest text-center font-mono"
                    placeholder="ROOM CODE"
                    maxlength="6"
                  >
                </div>
                <app-button 
                  variant="secondary" 
                  [disabled]="roomCode().length < 6"
                  (clicked)="joinRoom()"
                >
                  Join
                </app-button>
              </div>
            </div>
          }
        </app-card>
      </div>

      <!-- Footer -->
      <p class="text-gray-500 text-xs mt-8">For couples only • 18+</p>
    </div>
  `
})
export class LobbyComponent {
  protected authService = inject(AUTH_SERVICE);
  protected gameStateService = inject(GAME_STATE_SERVICE);
  private router = inject(Router);

  protected displayName = signal('');
  protected roomCode = signal('');

  async login() {
    if (!this.displayName()) return;
    try {
      await this.authService.loginAnonymously(this.displayName());
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async createRoom() {
    const user = (await this.getUser());
    if (!user) return;

    try {
      const room = await this.gameStateService.createRoom(user.displayName);
      this.router.navigate(['/game', room.code]);
    } catch (error) {
      console.error('Create room failed:', error);
    }
  }

  async joinRoom() {
    const user = (await this.getUser());
    if (!user || !this.roomCode()) return;

    try {
      const room = await this.gameStateService.joinRoom(this.roomCode(), user.displayName);
      this.router.navigate(['/game', room.code]);
    } catch (error) {
      console.error('Join room failed:', error);
    }
  }

  private async getUser(): Promise<UserProfile | undefined> {
    // Helper to get current user from observable
    return new Promise((resolve) => {
      this.authService.authState$.subscribe(state => {
        resolve(state.user);
      }).unsubscribe();
    });
  }
}
