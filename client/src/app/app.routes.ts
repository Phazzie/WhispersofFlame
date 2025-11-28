import { Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameRoomComponent } from './components/game-room/game-room.component';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'game/:code', component: GameRoomComponent },
  { path: '**', redirectTo: '' }
];
