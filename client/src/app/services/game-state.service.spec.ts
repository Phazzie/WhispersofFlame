import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';
import { MockGameStateService } from './mocks/mock-game-state.service';
import { GAME_STATE_SERVICE } from './tokens';
import { IGameStateService } from '@contracts/interfaces/IGameStateService';

describe('GameStateService', () => {
  let service: IGameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GAME_STATE_SERVICE, useClass: MockGameStateService }
      ]
    });
    service = TestBed.inject(GAME_STATE_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createRoom', () => {
    it('should create a room with a 6-character code', async () => {
      const room = await service.createRoom('Host');
      expect(room).toBeDefined();
      expect(room.code.length).toBe(6);
      expect(room.players.length).toBe(1);
      expect(room.players[0].name).toBe('Host');
    });
  });

  describe('joinRoom', () => {
    it('should throw error if room does not exist', async () => {
      await expect(service.joinRoom('INVALID', 'Player')).rejects.toThrow();
    });

    it('should join an existing room', async () => {
      const room = await service.createRoom('Host');
      const updatedRoom = await service.joinRoom(room.code, 'Player2');
      expect(updatedRoom.players.length).toBe(2);
      expect(updatedRoom.players[1].name).toBe('Player2');
    });
  });
});
