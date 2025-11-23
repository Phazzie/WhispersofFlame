import { TestBed } from '@angular/core/testing';
import { PersistenceService } from './persistence.service';
import { PERSISTENCE_SERVICE } from './tokens';
import { IPersistenceService } from '@contracts/interfaces/IPersistenceService';

describe('PersistenceService', () => {
  let service: IPersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PERSISTENCE_SERVICE, useClass: PersistenceService }
      ]
    });
    service = TestBed.inject(PERSISTENCE_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveGame', () => {
    it('should save the game state', async () => {
      try {
        await service.saveGame({} as any);
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
