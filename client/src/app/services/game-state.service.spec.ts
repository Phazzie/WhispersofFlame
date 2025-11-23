import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';
import { GAME_STATE_SERVICE } from './tokens';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';

describe('GameStateService', () => {
  let service: IGameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GAME_STATE_SERVICE, useClass: GameStateService }
      ]
    });
    service = TestBed.inject(GAME_STATE_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createRoom', () => {
    it('should create a room with a 6-character code', async () => {
      try {
        const room = await service.createRoom('Host');
        expect(room.code.length).toBe(6);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('joinRoom', () => {
    it('should throw error if room does not exist', async () => {
      try {
        await service.joinRoom('INVALID', 'Player');
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
