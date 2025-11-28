# Seam-Driven Development (SDD) – Practical Guide

> A battle-tested, implementation-focused guide for building new apps using Seam-Driven Development.

This document distills the original SDD guide plus the lessons learned from **Whispers of Flame** into a practical, step-by-step recipe you can apply to any new app.

---

## 1. Core Mindset

SDD is about **designing seams first**, then making Mock and Real implementations **behaviorally identical**.

Key principles:

- **Seams over services**: Every important boundary is an interface with a clear contract.
- **Mocks first, Reals later**: You write tests and mocks before the production implementation.
- **CCR = 1.0**: Contract Compliance Rate must reach 1.0 – Mock and Real pass the same tests.
- **No side quests**: Don’t wire UI or backends until the current seam loop is complete.

Think of each seam as a mini-project:

1. Define the interface and JSDoc (Contract)
2. Test against contract
3. Implement a fast in-memory Mock
4. Implement the Real version behind the same contract
5. Prove Mock ≡ Real via tests and tools

---

## 2. SDD Loop – Concrete Checklist

Use this as your default loop for every new seam.

### 2.1 Define the Seam (Interface)

**Goal:** Identify a boundary that should be an interface, not a concrete class.

Common seams:

- **Auth** – `IAuthService` (login, logout, currentUser$)
- **AI** – `IAIService` (generate, critique, summarize)
- **Game State** – `IGameStateService` (state machine + events)
- **Persistence** – `IPersistenceService` (save/load ephemeral state)
- **Payments**, **Notifications**, **Feature Flags**, etc.

**Checklist:**

- [ ] Name is clear and stable (e.g., `IAuthService`, not `AuthStuff`)
- [ ] Lives under `contracts/interfaces/` (or equivalent)
- [ ] No UI details, no transport details (HTTP, gRPC, etc.)
- [ ] Designed from **caller’s perspective** (what the app needs, not how it’s stored)

### 2.2 Write the Contract (Interface + JSDoc)

**Goal:** Capture WHAT, WHY, HOW at the interface level.

Each interface must have a top-level JSDoc:

```ts
/**
 * WHAT: Short summary of the seam’s responsibility.
 * WHY: Why this seam exists and what business risk it isolates.
 * HOW: High-level notes on expected implementations (e.g., Mock vs Real).
 */
export interface IExampleService {
  // ...
}
``

**Checklist:**

- [ ] JSDoc explains WHAT / WHY / HOW
- [ ] Methods use precise types (no `any`)
- [ ] Async boundaries are explicit (`Promise`, `Observable`, etc.)
- [ ] Domain types live in `contracts/types/` and are reused, not duplicated

### 2.3 Write Tests Against the Interface

**Goal:** Tests describe the contract in executable form.

You write tests that only know about `IWhateverService`, not the concrete class.

Example pattern (Vitest):

```ts
import { type IAuthService } from '...';

export function runAuthContractTests(name: string, factory: () => IAuthService) {
  describe(`Auth Contract – ${name}`, () => {
    it('logs in anonymously with displayName', async () => {
      const service = factory();
      const user = await service.loginAnonymously('TestUser');
      expect(user.displayName).toBe('TestUser');
    });

    // more contract tests...
  });
}
```

Then each implementation just calls the shared tests with its own factory.

**Checklist:**

- [ ] Tests live near the seam (e.g., `auth.service.spec.ts`)
- [ ] Tests import only the **interface** and contract test helper
- [ ] Tests cover normal, edge, and error behavior
- [ ] No mocking of the seam itself – the seam *is* the abstraction

### 2.4 Implement the Mock

**Goal:** A fast, deterministic, in-memory implementation.

Rules from Whispers of Flame:

- No static state; each test gets a fresh instance.
- No network, file system, or real databases.
- Just enough behavior to satisfy contract tests.

**Checklist:**

- [ ] Class lives under `services/mocks/` (or similar)
- [ ] Name is `MockXxxService` / `MockXxx` for easy discovery
- [ ] State is instance-level only (no `static` shared state)
- [ ] All contract tests pass with the Mock implementation

### 2.5 Implement the Real

**Goal:** Swap in a production implementation *without* changing tests.

Lessons learned:

- Start from the Mock behavior; don’t reinvent the API.
- Keep external dependencies behind the seam (HTTP, identity SDKs, etc.).
- Respect cross-cutting rules (privacy, security, performance).

**Checklist:**

- [ ] Class name mirrors the seam (e.g., `RealAuthService`)
- [ ] JSDoc explains WHAT / WHY / HOW for the Real implementation
- [ ] Uses dependency injection tokens (`InjectionToken` for Angular)
- [ ] Passes the exact same contract tests as the Mock

### 2.6 Verify CCR = 1.0

**Goal:** Prove that Mock and Real are behaviorally identical from the contract’s point of view.

In Whispers of Flame this is formalized with tools like `ccr:calculate` and `validate:mock-real-parity`, but conceptually:

- For every seam, run the **same test suite** against Mock and Real.
- If expectations differ, CCR < 1.0 and you’re not done.

**Checklist:**

- [ ] Contract tests run for Mock and Real
- [ ] Any discrepancies are fixed by adjusting contract / tests / implementations
- [ ] No new seam is started until CCR = 1.0 for the current one

---

## 3. Lessons Learned – What to Copy

### 3.1 Interfaces First, Implementation Second

When we skipped or rushed interface design, we paid for it with:

- Leaky abstractions (UI details inside services)
- Hard-to-mock dependencies
- CI rules that were painful to retrofit

**Rule:** Don’t create a Real class before the interface and contract tests exist.

### 3.2 Avoid `any` – push validation to the edges

Using `any` short-circuits SDD:

- Tests can’t express real expectations
- CCR becomes meaningless because types are vague

Instead:

- Use strong TypeScript types (interfaces, unions, `as const` arrays)
- Use Zod (or similar) for runtime validation at I/O boundaries

### 3.3 Keep Privacy / Security in the Contract

In Whispers of Flame, privacy rules influenced the contracts:

- `IAuthService` guarantees session-only storage
- `IPersistenceService` abstracts ephemeral vs. durable storage

When you design a new seam, embed non-functional requirements (privacy, security, performance) in the JSDoc and tests, not only in docs.

**Example:**

- Contract test asserts that `logout()` clears sensitive tokens.
- Contract test asserts that persisted game state is anonymized.

### 3.4 Mocks Are Not Toys – They Are Specs

A good mock is not “just for tests”; it’s a **runnable spec** of expected behavior.

Practically:

- Keep mocks simple and explicit
- Avoid adding “extra powers” that the Real implementation won’t have
- Use mocks as the reference when implementing the Real

### 3.5 CI as SDD Enforcer

Workflow lessons from this repo:

- PR validation runs type-checking, linting, tests, SDD checks.
- CCR jobs compute and report Contract Compliance Rate.
- Security/privacy workflows scan for persistence violations.

When building a new app, set up CI early to:

- Block merges when contracts are broken
- Warn on privacy/security rule violations
- Keep SDD discipline from drifting over time

---

## 4. Applying SDD to a New App – Step-by-Step

This is the recipe you can follow for a brand-new project.

### Step 1 – Identify Initial Seams

Start with 2–4 core seams. For most apps:

- Auth / Identity (`IAuthService`)
- Data / Domain (`IDomainService` or `IRepository` seams)
- UI State (`IUiStateService`)
- Integrations (payments, notifications, AI, etc.)

Write a one-liner for each: *“WHAT / WHY / HOW”*.

### Step 2 – Create `contracts/` First

Before any `src/app/**` or framework code:

- Create `contracts/interfaces/`
- Create `contracts/types/`
- Write interfaces with JSDoc

Don’t import framework types (Angular, React, Nest) into contracts – keep them pure TypeScript + domain types.

### Step 3 – Build Mocks + Contract Tests

For each interface:

1. Create a Mock implementation in `services/mocks/`
2. Create shared contract tests that accept a factory
3. Run tests only against the Mock at first

Move on only when Mock passes all contract tests.

### Step 4 – Implement Real Behind the Same Contract

For each seam:

1. Implement `RealXxxService` (or backend equivalent)
2. Wire it into DI so that:
   - App runtime uses Real
   - Tests can swap in Mock easily
3. Run contract tests with **both** Mock and Real

Fix discrepancies until CCR = 1.0.

### Step 5 – Add UI / API Surfaces

Only after seams are solid:

- Build UI components that talk to interfaces only
- Build API routes that use backend seams only

This keeps UI/API work from thrashing due to changing business logic.

### Step 6 – Harden CI and Tooling

From the start of the new app, copy the good parts:

- Type-check + lint + test in PR validation
- SDD-specific scripts:
  - `validate:naming` (or equivalent)
  - `validate:comments` (WHAT/WHY/HOW)
  - `validate:mock-real-parity`
- Optional CCR reporting step

Consider a weekly job that:

- Runs CCR calculation
- Posts a summary as an issue/comment

---

## 5. Minimal SDD Starter Checklist for a New App

When you spin up the new app, walk through this list:

1. **Repo structure**
   - [ ] `contracts/interfaces/` created
   - [ ] `contracts/types/` created
   - [ ] `src/services/mocks/` (or equivalent) created

2. **First 2–4 seams**
   - [ ] Interfaces written with JSDoc (WHAT/WHY/HOW)
   - [ ] Types extracted to `contracts/types/`

3. **Tests & Mocks**
   - [ ] Contract test helpers for each seam
   - [ ] Mocks pass all contract tests

4. **Real implementations**
   - [ ] Real classes implemented for at least one seam
   - [ ] Real passes same contract tests (CCR = 1.0 for that seam)

5. **CI**
   - [ ] PR workflow runs type-check, lint, tests
   - [ ] SDD checks wired (naming, comments, parity)

6. **Privacy/Security (if applicable)**
   - [ ] Seams carrying sensitive data have explicit rules in tests
   - [ ] No long-lived persistence without explicit contracts

---

## 6. How to Extend This Guide

As you build the new app, evolve this guide by:

- Adding new seam patterns (e.g., `IAnalyticsService`, `IFeatureFlagService`)
- Capturing pitfalls (e.g., “don’t leak framework types into contracts”)
- Recording examples of CCR failures and how you fixed them

Treat this document as a **living contract for how you build software**, just like your TypeScript interfaces are living contracts for runtime behavior.
