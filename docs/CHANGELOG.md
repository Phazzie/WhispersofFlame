# Changelog - Whispers of Flame

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial project structure.
- Seam-Driven Development (SDD) methodology definitions.
- Agent personas (`agents.md`).
- Instruction files for AI assistants (`.github/copilot-instructions.md`, `claude.md`, `gemini.md`).
- Project Roadmap (`docs/projectroadmap.md`) outlining the 6-phase SDD execution plan.

### Changed
- Refactored `docs/projectroadmap.md` to enforce a strict "Batch SDD" process (Contracts -> Tests -> Mocks -> Real) across the entire system, replacing the per-seam iterative approach.
- Refactored Angular Services to use `InjectionToken`s (`AUTH_SERVICE`, etc.) for 100% SDD compliance, allowing seamless swapping of Mock vs Real implementations.
- Implemented Mocks for all services (`MockAuthService`, `MockGameStateService`, `MockAIService`, `MockPersistenceService`).

### Added
- `client/src/app/services/tokens.ts`: Definitions for Service Injection Tokens.
- `client/src/app/services/mocks/`: Directory containing all Mock implementations.

### Fixed
- **Build Configuration**: Fixed `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.spec.json` to correctly resolve `@contracts/*` path aliases.
- **Test Environment**: Resolved Jasmine vs Vitest conflicts by removing `fail()` calls and fixing `test-setup.ts` duplicate code.
- **Test Execution**: Updated `vitest.config.ts` to properly load the test setup file.
- **SDD Compliance**: Updated all service tests (`auth`, `game-state`, `persistence`) to assert correct behavior against Mocks, achieving Green state.

## [0.2.0] - 2025-11-23 - Phase 5: Real Implementation (Auth)

### Added
- **RealAuthService**: Implemented `RealAuthService.ts` using `netlify-identity-widget` for production-grade authentication.
- **Runtime Validation**: Added `zod` schemas to `RealAuthService` to validate user data coming from Netlify, ensuring type safety at the runtime boundary.
- **Guest Persistence**: Implemented `localStorage` persistence for Guest users within `RealAuthService`, allowing hybrid sessions (Real + Guest) under the same `IAuthService` contract.
- **Real Service Tests**: Created `real-auth.service.spec.ts` to test the real implementation logic (mocking the Netlify SDK), ensuring CCR = 1.0 between Mock and Real.

### Changed
- **Error Cleanup**: Systematically resolved 40+ linter/compiler errors across the codebase (unused variables, imports, etc.) to ensure a clean build.
- **Test Configuration**: Updated `vitest` configuration and mocks to support testing of code that relies on global browser objects (like `localStorage` and `window`).

### Verified
- **SDD Compliance**: Confirmed that swapping `MockAuthService` for `RealAuthService` requires zero changes to the consuming application code, validating the `IAuthService` Seam.
