import { MockGameStateService } from './mocks/mock-game-state.service';
import { runGameStateServiceTests } from './game-state.contract';

describe('MockGameStateService', () => {
  runGameStateServiceTests(() => new MockGameStateService());
});
