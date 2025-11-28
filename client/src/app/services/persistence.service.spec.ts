import { MockPersistenceService } from './mocks/mock-persistence.service';
import { runPersistenceServiceTests } from './persistence.contract';

describe('MockPersistenceService', () => {
  runPersistenceServiceTests(() => new MockPersistenceService());
});
