import { TestBed } from '@angular/core/testing';
import { MockPersistenceService } from './mocks/mock-persistence.service';
import { PERSISTENCE_SERVICE } from './tokens';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';
import { GameRoom } from '@contracts/types/Game';

describe('PersistenceService', () => {
  let service: IPersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PERSISTENCE_SERVICE, useClass: MockPersistenceService }
      ]
    });
    service = TestBed.inject(PERSISTENCE_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveGame', () => {
    it('should save and retrieve the game state', async () => {
      const mockRoom: GameRoom = {
        code: 'TEST01',
        hostId: 'host',
        players: [],
        step: 'Lobby',
        spicyLevel: 'Mild',
        categories: [],
        answers: [],
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000
      };

      await service.saveGame(mockRoom);
      const retrieved = await service.getGame('TEST01');
      expect(retrieved).toEqual(mockRoom);
    });

    it('should return null for non-existent game', async () => {
      const retrieved = await service.getGame('NONEXISTENT');
      expect(retrieved).toBeNull();
    });
  });
});
