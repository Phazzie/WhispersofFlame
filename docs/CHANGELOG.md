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

## [2024-11-22] - CI/CD Infrastructure

### Added - GitHub Actions Workflows
- **PR Validation Workflow** (`.github/workflows/pr-validation.yml`):
  - Automated type checking (TypeScript strict mode)
  - ESLint with SDD rule enforcement (no `any` types)
  - Prettier format checking
  - Vitest test execution with coverage reporting
  - Build verification
  - SDD compliance validation (Mock-Real parity, naming conventions, God Classes)
  - Automated PR comments with validation results and coverage metrics

- **Automated Claude Code Review Workflow** (`.github/workflows/claude-review.yml`):
  - AI-powered code review on every PR
  - SDD compliance checking (type safety, naming conventions, documentation)
  - Automated issue detection and reporting
  - `@claude-code fix` command support for automated fixes
  - Auto-commit and push fixes to PR branch
  - Deep SDD analysis with complexity metrics and architectural violation detection

- **CCR Enforcement Workflow** (`.github/workflows/ccr-check.yml`):
  - Contract Compliance Rate (CCR) calculation and validation
  - Mock vs Real implementation behavioral comparison
  - Interface coverage verification (ensures every Interface has a Mock)
  - Automated CCR reports with detailed discrepancy analysis
  - Enforces SDD requirement: CCR = 1.0 for perfect compliance

- **Security & Privacy Workflow** (`.github/workflows/security.yml`):
  - Privacy enforcement: validates no persistent data storage
  - Browser storage scan (localStorage, sessionStorage, IndexedDB)
  - Dependency security audit (npm audit)
  - Secret scanning with TruffleHog
  - SAST analysis with CodeQL
  - NSFW content safety validation for Ember persona
  - Encryption verification for sensitive data
  - Scheduled daily security scans

### Added - SDD Validation Scripts
All scripts located in `/scripts/` directory:

- **`validate-mock-real-parity.ts`**:
  - Scans codebase for Mock and Real implementation pairs
  - Reports missing Mocks for Real services
  - Identifies orphaned Mock implementations
  - Enforces SDD rule: "Every Real implementation must have a Mock"

- **`validate-comments.ts`**:
  - Validates top-level WHAT/WHY/HOW comments in all TypeScript files
  - Enforces SDD documentation requirement
  - Reports files missing proper documentation headers
  - Provides example format for compliant comments

- **`validate-god-classes.ts`**:
  - Analyzes class complexity and responsibility count
  - Detects God Classes (>3 responsibilities or >15 methods)
  - Reports method and property counts per class
  - Enforces SDD rule: "Max 3 responsibilities per class"

- **`validate-naming.ts`**:
  - Enforces SDD naming conventions:
    - Interfaces: I*.ts with interface I* name
    - Mock implementations: *Mock*.ts or *.mock.ts
    - Real implementations: Real* when Mock exists
  - Provides suggestions for non-compliant files

- **`validate-no-persistence.ts`**:
  - Scans for data persistence violations (privacy requirement)
  - Detects: file writes, database connections, persistent cookies
  - Checks localStorage/sessionStorage for expiration mechanisms
  - Enforces WhispersofFlame rule: "No data persistence beyond session"

- **`calculate-ccr.ts`**:
  - Calculates Contract Compliance Rate (CCR)
  - Compares Mock vs Real test results
  - Generates detailed CCR reports with discrepancy analysis
  - Outputs JSON report for CI/CD consumption
  - Enforces CCR = 1.0 requirement

### Added - NPM Scripts
Enhanced `client/package.json` with comprehensive script suite:

**Testing:**
- `test:ci`: Verbose test execution for CI environments
- `test:coverage`: Test with coverage reporting
- `test:mock`: Run only Mock implementation tests
- `test:real`: Run only Real implementation tests
- `test:nsfw-filter`: Run NSFW content filter tests

**Type Checking & Linting:**
- `type-check`: TypeScript strict mode validation
- `lint`: ESLint execution
- `lint:no-any`: Enforce zero `any` types
- `format`: Auto-format with Prettier
- `format:check`: Verify Prettier formatting

**SDD Validation:**
- `validate:naming`: Check SDD naming conventions
- `validate:comments`: Verify WHAT/WHY/HOW documentation
- `validate:mock-real-parity`: Ensure Mock-Real pairs exist
- `validate:god-classes`: Detect classes with >3 responsibilities
- `validate:no-persistence`: Check for data persistence violations
- `ccr:calculate`: Calculate Contract Compliance Rate

**Placeholder Scripts:**
- `validate:interface-docs`: Interface JSDoc validation (TBD)
- `validate:ember-tone`: Ember AI persona tone validation (TBD)
- `validate:docs-updated`: Documentation update verification

### Added - Development Dependencies
- `@angular/eslint`: Angular-specific ESLint rules
- `@typescript-eslint/eslint-plugin`: TypeScript ESLint support
- `@typescript-eslint/parser`: TypeScript parser for ESLint
- `@vitest/coverage-v8`: Code coverage reporting
- `eslint`: JavaScript/TypeScript linter
- `glob`: File pattern matching for validation scripts
- `prettier`: Code formatter
- `ts-node`: TypeScript execution for scripts

### Infrastructure Benefits
- **Zero Human Error**: Machines enforce SDD rules, not developers
- **Fast Feedback**: Pre-commit and PR checks catch issues immediately
- **CCR Guarantee**: No code merges without perfect Mock-Real parity
- **Privacy Enforcement**: Automated validation of no-persistence rule
- **Security Gates**: Multi-layer validation (dependency audit, secret scanning, SAST)
- **Quality Metrics**: Automated coverage reporting and complexity analysis
- **AI-Powered Review**: Claude Code provides SDD-aware code review with auto-fix capabilities

### Workflow Triggers
- **PR Events**: `opened`, `synchronize`, `reopened`
- **Push to main/develop**: Runs validation on main branches
- **Scheduled**: Daily security scans at 2 AM UTC
- **Manual**: `@claude-code fix` comment triggers automated fixes

### Notes
- All validation scripts output warnings only (non-blocking) for initial adoption
- CCR enforcement can be made strict by uncommenting fail conditions
- Automated fixes require `ANTHROPIC_API_KEY` secret for Claude Code integration
- Scripts designed for gradual adoption as codebase matures
