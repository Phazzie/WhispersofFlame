import { InjectionToken } from '@angular/core';
import { IAuthService } from '@contracts/interfaces/IAuthService';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { IAIService } from '@contracts/interfaces/IAIService';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';

export const AUTH_SERVICE = new InjectionToken<IAuthService>('AUTH_SERVICE');
export const GAME_STATE_SERVICE = new InjectionToken<IGameStateService>('GAME_STATE_SERVICE');
export const AI_SERVICE = new InjectionToken<IAIService>('AI_SERVICE');
export const PERSISTENCE_SERVICE = new InjectionToken<IPersistenceService>('PERSISTENCE_SERVICE');
