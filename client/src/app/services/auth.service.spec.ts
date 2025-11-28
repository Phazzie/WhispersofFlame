import { MockAuthService } from './mocks/mock-auth.service';
import { runAuthServiceTests } from './auth.contract';

describe('MockAuthService', () => {
  runAuthServiceTests(() => new MockAuthService());
});
