import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';
import { GameRoom } from '@contracts/types/Game';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

export function runPersistenceServiceTests(createService: () => IPersistenceService, setup?: () => Promise<void>, teardown?: () => Promise<void>) {
  describe('IPersistenceService Contract', () => {
    let service: IPersistenceService;

    beforeEach(async () => {
      if (setup) await setup();
      service = createService();
    });

    afterEach(async () => {
      if (teardown) await teardown();
    });

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

    describe('saveGame & getGame', () => {
      it('should save and retrieve the game state', async () => {
        await service.saveGame(mockRoom);
        const retrieved = await service.getGame(mockRoom.code);
        expect(retrieved).toBeDefined();
        expect(retrieved?.code).toBe(mockRoom.code);
      });

      it('should return null for non-existent game', async () => {
        const retrieved = await service.getGame('NONEXISTENT');
        expect(retrieved).toBeNull();
      });
    });

    describe('deleteGame', () => {
      it('should delete an existing game', async () => {
        await service.saveGame(mockRoom);
        await service.deleteGame(mockRoom.code);
        const retrieved = await service.getGame(mockRoom.code);
        expect(retrieved).toBeNull();
      });

      it('should not throw when deleting non-existent game', async () => {
        await expect(service.deleteGame('NONEXISTENT')).resolves.not.toThrow();
      });
    });
  });
}
