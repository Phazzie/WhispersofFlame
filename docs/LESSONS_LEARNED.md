# Lessons Learned - Whispers of Flame

This document tracks architectural decisions, mistakes, and evolutions in the SDD process.

## Architectural Decisions
- **Framework**: Angular or SvelteKit selected for strict typing and performance.
- **AI Service**: Grok-4-fast-reasoning selected for NSFW capability (Ember persona).
- **Methodology**: Seam-Driven Development (SDD) with strict "Mock Everything" rule.

## Process Improvements
- **Instruction Files**: Centralized instructions for different AI agents to ensure consistency.
- **Documentation**: Moved all documentation to `docs/` to keep root clean.
- **Dependency Injection**: Adopted `InjectionToken` pattern for all services to ensure strict decoupling between Consumers and Implementations, enabling true "Mock Everything" capability.
- **Test Configuration**: Learned that Angular's `test-setup.ts` can easily duplicate imports if not carefully managed. Always verify the initialization block is unique.
- **Path Mapping**: TypeScript path aliases (`@contracts/*`) must be consistently defined in `tsconfig.json` and inherited by `tsconfig.app.json` and `tsconfig.spec.json` with `baseUrl` set correctly.
- **Testing Frameworks**: Mixing Jasmine syntax (`fail()`) with Vitest runner causes type errors. Stick to standard `throw new Error` or Vitest-compatible assertions.
- **Real Service Testing**: When testing "Real" implementations that wrap external SDKs (like Netlify Identity), you MUST mock the external SDK itself. Do not let tests make real network calls or open popups.
- **Linter Discipline**: A clean build is essential for SDD. Unused variables in interfaces/mocks should be prefixed with `_` or explicitly marked `void` to satisfy strict linters without breaking the contract signature.
- **Hybrid Auth Architecture**: Successfully implemented a "Hybrid" session check in `RealAuthService` that checks both the external provider (Netlify) and local storage (Guest) to provide a seamless experience. This proves the `IAuthService` contract was robust enough to handle implementation details hidden from the app.

## Scripting & Validation
- **TypeScript Execution**: `ts-node` can be finicky with ESM modules (like `glob` v10+). Switching to `tsx` provides a smoother experience for running TypeScript scripts directly.
- **Shebangs**: Using `#!/usr/bin/env tsx` in scripts ensures they run with the correct loader in CI environments.
- **Validation Performance**: Optimizing file scans (e.g., skipping test/mock files early) significantly reduces validation time in large codebases.
- **Strictness**: Validation scripts should be strict about patterns (e.g., requiring explicit WHAT/WHY/HOW in comments) to prevent "technical debt by ambiguity".
