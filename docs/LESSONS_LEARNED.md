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
