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

    describe('setCategories', () => {
      it('should update the categories', async () => {
        const room = await service.createRoom('Host');
        const categories = ['Intimacy', 'Romance', 'Trust'];
        await service.setCategories(room.code, categories);
        
        const state = await firstValueFrom(service.gameState$);
        expect(state?.categories).toEqual(categories);
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

    describe('generateNextQuestion', () => {
      it('should generate a question and set currentQuestion', async () => {
        const room = await service.createRoom('Host');
        await service.setCategories(room.code, ['Connection']);
        await service.setSpicyLevel(room.code, 'Mild');
        
        const question = await service.generateNextQuestion(room.code);
        
        expect(question).toBeDefined();
        expect(question.id).toBeDefined();
        expect(question.text).toBeDefined();
        expect(question.spicyLevel).toBe('Mild');
        
        const state = await firstValueFrom(service.gameState$);
        expect(state?.currentQuestion).toEqual(question);
      });
    });

    describe('submitAnswer', () => {
      it('should add answer to the room answers', async () => {
        const room = await service.createRoom('Host');
        await service.setCategories(room.code, ['Connection']);
        await service.generateNextQuestion(room.code);
        
        const playerId = room.players[0].id;
        await service.submitAnswer(room.code, playerId, 'My answer');
        
        const state = await firstValueFrom(service.gameState$);
        expect(state?.answers.length).toBe(1);
        expect(state?.answers[0].text).toBe('My answer');
        expect(state?.answers[0].playerId).toBe(playerId);
      });
    });

    describe('getQAPairs', () => {
      it('should return Q&A pairs for summary generation', async () => {
        const room = await service.createRoom('Host');
        await service.setCategories(room.code, ['Connection']);
        await service.generateNextQuestion(room.code);
        
        const playerId = room.players[0].id;
        await service.submitAnswer(room.code, playerId, 'Answer 1');
        
        const qaPairs = service.getQAPairs(room.code);
        
        expect(qaPairs.length).toBe(1);
        expect(qaPairs[0].question).toBeDefined();
        expect(qaPairs[0].answers).toContain('Answer 1');
      });

      it('should return empty array for non-existent room', () => {
        const qaPairs = service.getQAPairs('NONEXISTENT');
        expect(qaPairs).toEqual([]);
      });
    });
  });
}
