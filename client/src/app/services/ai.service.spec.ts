import { MockAIService } from './mocks/mock-ai.service';
import { runAIServiceTests } from './ai.contract';

describe('MockAIService', () => {
  runAIServiceTests(() => new MockAIService());
});
