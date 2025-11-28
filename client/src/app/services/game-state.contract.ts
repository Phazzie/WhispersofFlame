import { IGameStateService } from '@contracts/interfaces/IGameStateService';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

export function runGameStateServiceTests(createService: () => IGameStateService, setup?: () => Promise<void>, teardown?: () => Promise<void>) {
  describe('IGameStateService Contract', () => {
    let service: IGameStateService;

    beforeEach(async () => {
      if (setup) await setup();
      service = createService();
    });

    afterEach(async () => {
      if (teardown) await teardown();
    });

    describe('createRoom', () => {
      it('should create a room with a 6-character code', async () => {
        const room = await service.createRoom('Host');
        expect(room).toBeDefined();
        expect(room.code).toBeDefined();
        expect(room.code.length).toBe(6);
        expect(room.players.length).toBe(1);
        expect(room.players[0].name).toBe('Host');
        expect(room.players[0].isHost).toBe(true);
      });

      it('should update gameState$ after creating room', async () => {
        await service.createRoom('Host');
        const state = await firstValueFrom(service.gameState$);
        expect(state).toBeDefined();
        expect(state?.players[0].name).toBe('Host');
      });
    });

    describe('joinRoom', () => {
      it('should join an existing room', async () => {
        const room = await service.createRoom('Host');
        const updatedRoom = await service.joinRoom(room.code, 'Player2');
        
        expect(updatedRoom.players.length).toBe(2);
        expect(updatedRoom.players.find(p => p.name === 'Player2')).toBeDefined();
      });

      it('should throw error if room does not exist', async () => {
        await expect(service.joinRoom('INVALID', 'Player')).rejects.toThrow();
      });
    });

    describe('updateStep', () => {
      it('should update the game step', async () => {
        const room = await service.createRoom('Host');
        await service.updateStep(room.code, 'CategorySelection');
        
        const state = await firstValueFrom(service.gameState$);
        expect(state?.step).toBe('CategorySelection');
      });
    });

    describe('setSpicyLevel', () => {
      it('should update the spicy level', async () => {
        const room = await service.createRoom('Host');
        await service.setSpicyLevel(room.code, 'Hot');
        
        const state = await firstValueFrom(service.gameState$);
        expect(state?.spicyLevel).toBe('Hot');
      });
    });
  });
}
