import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/lobby/lobby.component').then(m => m.LobbyComponent) 
  },
  { 
    path: 'game/:code', 
    loadComponent: () => import('./components/game-room/game-room.component').then(m => m.GameRoomComponent),
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '' }
];
