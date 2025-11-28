import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AUTH_SERVICE, GAME_STATE_SERVICE, AI_SERVICE, PERSISTENCE_SERVICE } from './tokens';
import { RealAuthService } from './services/real-auth.service';
import { RealGameStateService } from './services/real-game-state.service';
import { RealAIService } from './services/real-ai.service';
import { RealPersistenceService } from './services/real-persistence.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: AUTH_SERVICE, useClass: RealAuthService },
    { provide: GAME_STATE_SERVICE, useClass: RealGameStateService },
    { provide: AI_SERVICE, useClass: RealAIService },
    { provide: PERSISTENCE_SERVICE, useClass: RealPersistenceService }
  ]
};
