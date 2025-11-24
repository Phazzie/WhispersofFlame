# AI Instructions - Whispers of Flame

You are an expert AI assistant working on **Whispers of Flame**, a high-stakes intimacy game for couples.
Your goal: enforce **Seam-Driven Development (SDD)** and achieve **Contract Compliance Rate (CCR) = 1.0**.

## Project Context

- **Domain**: Intimacy game for couples (playful, spicy, safe, encrypted)
- **AI Persona**: "Ember" (powered by Grok-4-fast-reasoning for NSFW flexibility)
- **Key Constraint**: Privacy is paramount. No data persistence beyond session.

## Tech Stack

- **Framework**: Angular 21 (TypeScript strict mode)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Validation**: Zod (runtime schema validation)
- **Styling**: Tailwind CSS
- **AI Service**: Grok-4-fast-reasoning (via OpenRouter API)

## Seam-Driven Development (SDD)

We build isolated components (Seams) that communicate via strict Contracts.

### The SDD Loop
1. **Define Seam**: Identify boundary (e.g., `IAuthService`)
2. **Write Contract**: Create Interface with extensive JSDoc
3. **Write Tests**: Create `auth.service.spec.ts` against Interface
4. **Mock It**: Create `MockAuthService` to pass tests
5. **Implement It**: Create `RealAuthService` to pass *same* tests
6. **Verify CCR**: Ensure Mock and Real behave identically (CCR = 1.0)

### Example: Interface → Mock → Real

```typescript
// contracts/IAuthService.ts
/**
 * WHAT: Authentication service contract for guest/anonymous login
 * WHY: Isolates auth logic from UI, enables Mock/Real swapping
 * HOW: Implement with Firebase (Real) or in-memory (Mock)
 */
export interface IAuthService {
  loginAnonymously(displayName: string): Promise<UserProfile>;
  logout(): Promise<void>;
  currentUser$: Observable<UserProfile | null>;
}

// mocks/MockAuthService.ts
export class MockAuthService implements IAuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.userSubject.asObservable();

  async loginAnonymously(displayName: string): Promise<UserProfile> {
    const user = { id: crypto.randomUUID(), displayName, createdAt: Date.now() };
    this.userSubject.next(user);
    return user;
  }

  async logout(): Promise<void> {
    this.userSubject.next(null);
  }
}

// services/RealAuthService.ts
export class RealAuthService implements IAuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.userSubject.asObservable();

  async loginAnonymously(displayName: string): Promise<UserProfile> {
    const credential = await signInAnonymously(this.auth);
    const user = { id: credential.user.uid, displayName, createdAt: Date.now() };
    this.userSubject.next(user);
    return user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userSubject.next(null);
  }
}
```

## MCP Agent Collaboration

**You have access to MCP collaboration tools** at `/workspaces/WhispersofFlame/mcp-agent-collab/` for coordinating with other AI agents.

### When to Use
- **Before starting**: Check `collab://state/tasks` to avoid duplicate work
- **Complex code**: Use `request_review` to get feedback
- **Sharing decisions**: Use `set_shared_context` for API endpoints, patterns
- **When stuck**: Use `ask_for_help` to leverage other agents' expertise
- **Task planning**: Use `coordinate_task` to divide large features

### Available Tools
- `request_review`, `respond_to_review` - Code reviews
- `ask_for_help`, `respond_to_help` - Q&A
- `share_progress` - Broadcast task status
- `coordinate_task` - Work division
- `set_shared_context` - Share context (APIs, patterns, decisions)
- `clear_completed` - Cleanup

**Full docs**: [MCPINFO.md](../MCPINFO.md)

## Coding Standards (Show, Don't Tell)

### NO `any` Types - Ever

```typescript
// ❌ WRONG
function processData(data: any) {
  return data.value;
}

// ✅ CORRECT: Use unknown and narrow
function processData(data: unknown): string {
  const validated = DataSchema.parse(data); // Zod validation
  return validated.value;
}

// ✅ CORRECT: Use proper typing
interface GameData {
  value: string;
  score: number;
}
function processData(data: GameData): string {
  return data.value;
}
```

### TypeScript Patterns

```typescript
// Use readonly for immutability
interface UserProfile {
  readonly id: string;
  readonly createdAt: number;
  displayName: string; // mutable
}

// Use discriminated unions for state machines
type GameState =
  | { step: 'Lobby'; players: Player[] }
  | { step: 'Question'; question: Question }
  | { step: 'Reveal'; answers: Answer[] };

// Use utility types
type PartialUser = Partial<UserProfile>; // All optional
type UserIdOnly = Pick<UserProfile, 'id'>; // Select specific
type NoCreatedAt = Omit<UserProfile, 'createdAt'>; // Exclude specific

// Use as const for literal types
const SPICE_LEVELS = ['mild', 'medium', 'hot', 'extreme'] as const;
type SpiceLevel = typeof SPICE_LEVELS[number]; // 'mild' | 'medium' | ...
```

### RxJS Memory Management (CRITICAL)

```typescript
// ❌ WRONG: Memory leak - no cleanup
ngOnInit() {
  this.authService.currentUser$.subscribe(user => {
    this.user = user; // Never unsubscribes!
  });
}

// ✅ CORRECT: Use async pipe (no subscription needed)
// template: <div *ngIf="user$ | async as user">{{ user.displayName }}</div>
user$ = this.authService.currentUser$;

// ✅ CORRECT: Use takeUntil pattern
private destroyed$ = new Subject<void>();

ngOnInit() {
  this.authService.currentUser$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(user => this.user = user);
}

ngOnDestroy() {
  this.destroyed$.next();
  this.destroyed$.complete();
}

// Common RxJS operators
this.searchInput$.pipe(
  debounceTime(300),           // Wait 300ms after typing stops
  distinctUntilChanged(),       // Only if value changed
  switchMap(query => this.api.search(query)) // Cancel previous, start new
).subscribe(results => this.results = results);
```

### Angular Dependency Injection

```typescript
// Use InjectionTokens for interfaces (enables Mock/Real swapping)
export const AUTH_SERVICE = new InjectionToken<IAuthService>('AuthService');

// In providers (main.ts or component)
providers: [
  { provide: AUTH_SERVICE, useClass: MockAuthService } // or RealAuthService
]

// In component - use inject() function
export class LoginComponent {
  private authService = inject(AUTH_SERVICE);

  async login(displayName: string) {
    await this.authService.loginAnonymously(displayName);
  }
}
```

### Zod Validation at Boundaries

```typescript
// Define schema, infer TypeScript type
const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(50),
  createdAt: z.number().int().positive()
});

type UserProfile = z.infer<typeof UserProfileSchema>; // TypeScript type from Zod!

// Validate at API boundaries
async function fetchUser(id: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // Runtime validation
  const result = UserProfileSchema.safeParse(data);
  if (!result.success) {
    console.error('Validation failed:', result.error);
    throw new Error('Invalid user data from API');
  }
  return result.data; // Fully typed!
}
```

### Testing with Vitest (AAA Pattern)

```typescript
describe('AuthService', () => {
  let service: IAuthService;

  beforeEach(() => {
    // Arrange: Setup
    service = new MockAuthService();
  });

  it('should login anonymously with valid displayName', async () => {
    // Arrange: Prepare data
    const displayName = 'TestUser';

    // Act: Execute
    const user = await service.loginAnonymously(displayName);

    // Assert: Verify
    expect(user.displayName).toBe(displayName);
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeGreaterThan(0);
  });

  it('should emit user via currentUser$ observable', async () => {
    // Arrange
    const displayName = 'TestUser';
    let emittedUser: UserProfile | null = null;
    service.currentUser$.subscribe(user => emittedUser = user);

    // Act
    await service.loginAnonymously(displayName);

    // Assert
    expect(emittedUser?.displayName).toBe(displayName);
  });
});
```

### Security Patterns

```typescript
// XSS Prevention - Angular templates are safe by default
// template: <div>{{ userInput }}</div>  ✅ Auto-escaped

// For HTML content, use DomSanitizer
constructor(private sanitizer: DomSanitizer) {}

getSafeHtml(userHtml: string): SafeHtml {
  return this.sanitizer.sanitize(SecurityContext.HTML, userHtml) || '';
}

// Input validation with Zod
const LoginSchema = z.object({
  displayName: z.string()
    .min(1, 'Name required')
    .max(50, 'Name too long')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Only letters, numbers, spaces')
});

// Privacy: Session-only storage (CRITICAL for WhispersofFlame)
// ❌ WRONG: localStorage persists across sessions
localStorage.setItem('user', JSON.stringify(user));

// ✅ CORRECT: sessionStorage clears on tab close
sessionStorage.setItem('user', JSON.stringify(user));

// ✅ BEST: In-memory only (no persistence)
private userSubject = new BehaviorSubject<UserProfile | null>(null);
```

## Forbidden Patterns

```typescript
// ❌ Tight Coupling
class GameEngine {
  constructor(private firebase: FirebaseService) {} // Depends on concrete class
}

// ✅ Loose Coupling
class GameEngine {
  constructor(private authService: IAuthService) {} // Depends on interface
}

// ❌ Stateful Mocks
class MockAuthService {
  static currentUser: UserProfile; // Shared state across tests!
}

// ✅ Stateless Mocks
class MockAuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null); // Instance state
}

// ❌ Magic Strings
if (user.role === 'admin') {}

// ✅ Constants/Enums
const ROLES = { ADMIN: 'admin', USER: 'user' } as const;
if (user.role === ROLES.ADMIN) {}

// ❌ God Classes (>3 responsibilities)
class GameService {
  handleAuth() {}
  renderUI() {}
  saveData() {}
  sendEmail() {}
}

// ✅ Single Responsibility
class AuthService { handleAuth() {} }
class UIService { renderUI() {} }
class DataService { saveData() {} }
```

## Documentation & Process

### Top-Level Comments (Mandatory)
```typescript
/**
 * WHAT: Authentication service for anonymous guest login
 * WHY: Enable couples to play without accounts (privacy-first)
 * HOW: Uses Firebase Anonymous Auth + session-only storage
 */
export class RealAuthService implements IAuthService {
  // ...
}
```

### Update Docs After Significant Changes
- **Trigger**: User says "Update Docs" OR you complete a major feature
- **Files**: Update `docs/CHANGELOG.md` and `docs/LESSONS_LEARNED.md`
- **Location**: All new docs go in `docs/` directory

## Key Tenets

- **Mock Everything**: Every external dependency must be mocked
- **Regenerate > Debug**: If it fails twice, delete and rewrite from Contract
- **One Thing at a Time**: Finish current Seam before starting next
- **Interfaces First**: Define shape before implementation
- **CCR = 1.0**: Mock and Real must be behaviorally identical
- **No `any` Types**: Use `unknown` and narrow with Zod validation
- **Cleanup Subscriptions**: Use `async` pipe or `takeUntil()`
- **Privacy First**: Session-only storage, no persistence

---

**Remember**: You are building a "World Class" application. Good enough is not enough. Perfection is the standard.
