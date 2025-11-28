# Lessons Learned - Whispers of Flame

This document tracks architectural decisions, mistakes, and evolutions in the SDD process.

---

## Table of Contents
1. [Architectural Decisions](#architectural-decisions)
2. [Process Improvements](#process-improvements)
3. [CI/CD & GitHub Actions](#cicd--github-actions)
4. [Scripting & Validation](#scripting--validation)
5. [MCP Agent Collaboration](#mcp-agent-collaboration)
6. [UI Development & Component Architecture](#ui-development--component-architecture-phase-7)
7. [Anti-Patterns & Mistakes](#anti-patterns--mistakes)

---

## Architectural Decisions

### Core Technology Choices
- **Framework**: Angular 21 selected for strict typing, signals, and enterprise-grade tooling.
- **AI Service**: Grok-4-fast-reasoning selected for NSFW capability (Ember persona) via OpenRouter API.
- **Methodology**: Seam-Driven Development (SDD) with strict "Mock Everything" rule.
- **Testing**: Vitest over Jasmine for faster execution and better TypeScript support.
- **Styling**: Tailwind CSS v3 for utility-first CSS with JIT compilation.
- **Validation**: Zod for runtime schema validation at API boundaries.

### SDD Principles Validated
- **Interface-First Design**: Defining `IAuthService`, `IGameStateService`, etc. before implementation enabled parallel Mock/Real development.
- **CCR = 1.0 Target**: Contract Compliance Rate ensures Mock and Real implementations are behaviorally identical.
- **Regenerate > Debug**: When a seam fails twice, delete and rewrite from the contract rather than debugging.

## Process Improvements

### Development Workflow
- **Instruction Files**: Centralized instructions for different AI agents (`.github/copilot-instructions.md`, `claude.md`, `gemini.md`) ensures consistency across AI assistants.
- **Documentation Structure**: Moved all documentation to `docs/` to keep repository root clean.
- **Batch SDD Process**: Changed from per-seam iterative to system-wide batching: All Contracts → All Tests → All Mocks → All Real.

### Angular & TypeScript
- **Dependency Injection**: Adopted `InjectionToken` pattern for all services to ensure strict decoupling between Consumers and Implementations, enabling true "Mock Everything" capability.
- **Test Configuration**: Angular's `test-setup.ts` can easily duplicate imports if not carefully managed. Always verify the initialization block is unique.
- **Path Mapping**: TypeScript path aliases (`@contracts/*`) must be consistently defined in `tsconfig.json` and inherited by `tsconfig.app.json` and `tsconfig.spec.json` with `baseUrl` set correctly.
- **Testing Frameworks**: Mixing Jasmine syntax (`fail()`) with Vitest runner causes type errors. Stick to standard `throw new Error` or Vitest-compatible assertions.

### Service Implementation
- **Real Service Testing**: When testing "Real" implementations that wrap external SDKs (like Netlify Identity), you MUST mock the external SDK itself. Do not let tests make real network calls or open popups.
- **Linter Discipline**: A clean build is essential for SDD. Unused variables in interfaces/mocks should be prefixed with `_` or explicitly marked `void` to satisfy strict linters without breaking the contract signature.
- **Hybrid Auth Architecture**: Successfully implemented a "Hybrid" session check in `RealAuthService` that checks both the external provider (Netlify) and local storage (Guest) to provide a seamless experience. This proves the `IAuthService` contract was robust enough to handle implementation details hidden from the app.

## CI/CD & GitHub Actions

### Workflow Design
- **Separation of Concerns**: Split workflows by purpose (PR validation, Claude review, CCR check, Security) rather than monolithic pipeline.
- **Exit Codes Matter**: Validation scripts must return non-zero exit codes on failure for CI to properly gate merges.
- **Conditional Steps**: Use `if: always()` for cleanup steps, `if: success()` for dependent steps.
- **Artifact Sharing**: Use GitHub Actions artifacts to share test results between jobs (e.g., Mock results → CCR calculation).

### PR Automation
- **Auto-Comments**: GitHub Actions can post PR comments with validation results using `github-script` action.
- **Claude Code Integration**: AI-powered code review requires `ANTHROPIC_API_KEY` secret and careful prompt engineering.
- **Branch Protection**: Enable required status checks only after workflows are stable to avoid blocking all PRs.

### Security Considerations
- **Secret Management**: Never echo secrets in logs. Use `::add-mask::` for dynamic secrets.
- **Dependency Auditing**: `npm audit` catches known vulnerabilities but may have false positives. Review before failing builds.
- **SAST Scheduling**: Daily security scans catch issues that slip through PR checks.

## Scripting & Validation

### TypeScript Script Execution
- **TypeScript Execution**: `ts-node` can be finicky with ESM modules (like `glob` v10+). Switching to `tsx` provides a smoother experience for running TypeScript scripts directly.
- **Shebangs**: Using `#!/usr/bin/env tsx` in scripts ensures they run with the correct loader in CI environments.
- **Script TypeScript Config**: Scripts in `/scripts/` directory need their own `tsconfig.json` with `typeRoots` pointing to `../client/node_modules/@types` to resolve Node.js types.

### Validation Script Design
- **Validation Performance**: Optimizing file scans (e.g., skipping test/mock files early) significantly reduces validation time in large codebases.
- **Strictness Levels**: Validation scripts should be strict about patterns (e.g., requiring explicit WHAT/WHY/HOW in comments) to prevent "technical debt by ambiguity".
- **Glob Patterns**: Use `glob.sync()` for simplicity in validation scripts. Async glob adds complexity without benefit for small codebases.
- **Exit Codes**: Scripts must `process.exit(1)` on validation failure for CI integration. Logging warnings without failing is only for adoption phases.

### CCR Calculation
- **Seam Name Normalization**: CCR calculation must normalize test names (e.g., "MockAuthService" → "AuthService", "RealAuthService" → "AuthService") to compare Mock vs Real results.
- **JSON Output**: Use `--reporter=json --outputFile=results.json` for machine-readable test results.
- **Separate Test Runs**: Run Mock and Real tests separately (`test:mock`, `test:real`) to isolate results for CCR comparison.

## MCP Agent Collaboration

### Protocol Design
- **Seam-Driven MCP**: Applied SDD to MCP server itself: 4 interfaces (`ICollaborationStore`, `IIdGenerator`, `IToolHandler`, `IResourceProvider`) with Mock/Real pairs.
- **Stateless Tools**: MCP tools should be stateless; state lives in the store. This enables easy mocking and testing.
- **Resource URIs**: Use `collab://state/{resource}` pattern for predictable resource addressing.

### Implementation Insights
- **In-Memory Store**: Start with in-memory storage (`Map`, `Array`) for MVP. Database can be swapped later via interface.
- **ID Generation**: Use `crypto.randomUUID()` for collision-free IDs. Prefix with type (`review-`, `help-`, `coord-`).
- **Tool Validation**: Validate tool arguments with Zod before processing. Return descriptive errors for missing/invalid args.

### Testing Strategy
- **185 Tests**: Comprehensive coverage includes unit tests, contract tests, and CCR verification tests.
- **CCR Verification Tests**: Explicitly test that Mock and Real return identical results for same inputs.
- **Jest Configuration**: Use `testPathIgnorePatterns` to exclude helpers from test discovery.

## UI Development & Component Architecture (Phase 7)

### Tailwind CSS
- **Tailwind Version Management**: Tailwind v4 lacks CLI tooling (`npx tailwindcss init` fails). Stick with v3 for stability until v4 has proper CLI support.
- **Content Path Configuration**: Tailwind content paths must include all template locations: `./src/**/*.{html,ts}` to scan both Angular templates and inline templates.
- **JIT Mode**: Tailwind v3 JIT is enabled by default. No need for `mode: 'jit'` in config.

### Angular Modern Patterns
- **Modern Angular Control Flow**: Angular 21+ prefers `@if`, `@for`, `@switch` over structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`). Modern syntax is more readable and performant.
- **InjectionToken Strategy**: Centralizing tokens in a single `tokens.ts` file prevents duplication and makes service swapping easier across the app.
- **Signal-Based Local State**: Using Angular signals for component-local state (like `displayName`, `loading`) provides reactive updates without RxJS boilerplate for simple cases.
- **Standalone Components**: All components should be `standalone: true` in Angular 21. No more NgModules needed.

### Component Design
- **Atomic Component Design**: Building a library of small, reusable UI atoms (Button, Input, Card, Loader) before complex features accelerates development and ensures consistency.
- **ControlValueAccessor**: Implementing CVA on custom input components enables seamless `ngModel` binding and form integration without wrapper logic.
- **Component Communication**: For parent-child communication, prefer `@Output` events over direct service calls to maintain component isolation and reusability.

### State Management
- **Step-Based Game Flow**: Using discriminated unions for game state (`{ step: 'Category' }`, `{ step: 'Question' }`) with `@switch` provides type-safe routing without complex state machines.
- **Optional Chaining in Templates**: Always use optional chaining (`question?.category`) in templates to prevent runtime errors when observables emit undefined during transitions.

### Routing & Navigation
- **Router Navigation**: Use Angular's `Router.navigate()` with absolute paths (`['/game', code]`) for reliable navigation, not relative paths which can break in nested routes.
- **Route Guards**: Consider `canActivate` guards to protect routes requiring authentication.

### Testing
- **Test Updates**: When refactoring templates, update corresponding tests immediately. Tests checking for removed elements (like `<h1>Hello</h1>`) will fail after template changes.
- **Component Test Setup**: Use `TestBed.configureTestingModule()` with `providers` to inject mock services via InjectionTokens.

## Anti-Patterns & Mistakes

### What NOT to Do
- **Tight Coupling**: Don't inject concrete classes (`FirebaseService`). Always inject interfaces via tokens (`AUTH_SERVICE`).
- **God Classes**: Don't create classes with >3 responsibilities. Split into focused services.
- **Magic Strings**: Don't use inline strings for roles, steps, levels. Use `as const` objects or enums.
- **Stateful Mocks**: Don't use static properties on mock classes. Each test should get fresh instance.
- **Any Types**: Never use `any`. Use `unknown` and narrow with Zod validation.
- **Persistent Storage**: Don't use `localStorage` for sensitive data in this privacy-first app. Session-only or in-memory.

### Common Mistakes Made & Fixed
1. **Tailwind v4 Install**: Tried to use `npx tailwindcss init` with v4, which doesn't exist. Fixed by downgrading to v3.
2. **Jasmine/Vitest Mix**: Used `fail()` from Jasmine in Vitest tests. Fixed by using `throw new Error()`.
3. **Missing afterEach Imports**: Contract test files missing `afterEach` import from vitest. Fixed by adding to import list.
4. **Test Checking Removed Content**: App test checked for "Hello, client" text after template was changed. Fixed by updating test to check for `router-outlet`.
5. **Relative Route Navigation**: Used relative paths in `Router.navigate()`. Fixed by using absolute paths.

---

## Quick Reference

### SDD Checklist
- [ ] Interface defined in `contracts/interfaces/`
- [ ] Types defined in `contracts/types/`
- [ ] Contract test written (`.spec.ts`)
- [ ] Mock implementation passes tests
- [ ] Real implementation passes same tests
- [ ] CCR = 1.0 verified

### File Naming Conventions
| Type | Pattern | Example |
|------|---------|---------|
| Interface | `I{Name}.ts` | `IAuthService.ts` |
| Mock | `Mock{Name}.ts` | `MockAuthService.ts` |
| Real | `Real{Name}.ts` | `RealAuthService.ts` |
| Contract Test | `{name}.contract.ts` | `auth.contract.ts` |
| Service Test | `{name}.service.spec.ts` | `auth.service.spec.ts` |

### CCR Commands
```bash
npm run test:mock -- --reporter=json --outputFile=mock-results.json
npm run test:real -- --reporter=json --outputFile=real-results.json
npm run ccr:calculate
```

---

*Last Updated: 2025-11-28*
