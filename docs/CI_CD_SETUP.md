# CI/CD Setup Guide - WhispersofFlame

## Overview

This document describes the complete CI/CD infrastructure for WhispersofFlame, designed to enforce SEAM-Driven Development (SDD) principles through automation.

## Philosophy

**"Automation > Discipline"** - If a rule is important enough, it should be enforced by machines, not humans.

## Workflows

### 1. PR Validation ([pr-validation.yml](.github/workflows/pr-validation.yml))

**Triggers:** Every Pull Request (opened, synchronized, reopened)

**Purpose:** Validates code quality, tests, and SDD compliance

**Checks:**
- ✅ TypeScript type checking (strict mode)
- ✅ ESLint (enforces no `any` types)
- ✅ Prettier formatting
- ✅ Vitest test execution
- ✅ Test coverage reporting
- ✅ Mock-Real parity validation
- ✅ Top-level comment validation (WHAT/WHY/HOW)
- ✅ God Class detection
- ✅ SDD naming conventions
- ✅ Build verification

**Output:**
- Automated PR comment with validation results
- Test coverage metrics
- Build status

**Exit Codes:**
- Fails if: Type errors, lint errors, test failures, build failures
- Warnings only: SDD validations (Mock-Real parity, naming, God Classes, comments)

---

### 2. Automated Claude Code Review ([claude-review.yml](.github/workflows/claude-review.yml))

**Triggers:**
- Every Pull Request
- Comments containing `@claude-code` on PRs

**Purpose:** AI-powered code review with SDD awareness and automated fixes

**Features:**

#### Automatic Review
- Analyzes all changed files
- Checks SDD compliance (contracts, naming, documentation)
- Identifies type safety issues
- Detects architectural violations
- Posts detailed review comments

#### Automated Fixes
- Reply `@claude-code fix` to any PR comment
- Claude Code will:
  - Analyze the issue
  - Generate fix code
  - Apply the fix
  - Run linting and formatting
  - Commit and push to PR branch

#### Deep SDD Analysis
- Complexity metrics
- Architecture violation detection
- Contract compliance verification
- Security issue scanning

**Requirements:**
- `ANTHROPIC_API_KEY` secret must be set in GitHub repository settings
- Claude Code API access

**Example Usage:**
```
1. Open a PR
2. Claude Code automatically reviews it
3. If issues are found, reply: "@claude-code fix"
4. Claude Code applies fixes and pushes to your branch
```

---

### 3. CCR Enforcement ([ccr-check.yml](.github/workflows/ccr-check.yml))

**Triggers:**
- Pull Requests
- Push to main/develop

**Purpose:** Ensures Contract Compliance Rate (CCR) = 1.0

**What is CCR?**
CCR measures behavioral parity between Mock and Real implementations. A CCR of 1.0 means they are mathematically identical in behavior.

**Process:**
1. Find all Mock implementations
2. Find all Real implementations
3. Run tests against Mock
4. Run tests against Real
5. Compare results
6. Calculate CCR

**Checks:**
- ✅ Every Real has a Mock
- ✅ Mock and Real pass same tests
- ✅ Test results are identical
- ✅ No orphaned Mocks

**Output:**
- CCR score (0.0 to 1.0)
- List of Mock-Real pairs
- Discrepancy details
- Artifacts: `ccr-report.json`, `mock-results.json`, `real-results.json`

**SDD Rule:** No progression to next phase until CCR = 1.0

---

### 4. Security & Privacy ([security.yml](.github/workflows/security.yml))

**Triggers:**
- Pull Requests
- Push to main/develop
- Scheduled (daily at 2 AM UTC)

**Purpose:** Enforce privacy and security requirements

**Checks:**

#### Privacy Enforcement
- ✅ No persistent data storage
- ✅ localStorage/sessionStorage expiration
- ✅ No IndexedDB usage
- ✅ No database connections for user data
- ✅ Session-only storage validation

#### Dependency Security
- ✅ npm audit (moderate+ vulnerabilities)
- ✅ Outdated package detection
- ✅ Audit report generation

#### Secret Scanning
- ✅ TruffleHog secret detection
- ✅ Hardcoded API key detection
- ✅ Token pattern scanning
- ✅ Password pattern detection

#### SAST Analysis
- ✅ CodeQL static analysis
- ✅ Security vulnerability detection
- ✅ CWE pattern matching

#### NSFW Content Safety
- ✅ NSFW filter tests
- ✅ Ember AI persona tone validation
- ✅ Content appropriateness checks
- ✅ "Playful, Not Porny" enforcement

**WhispersofFlame Privacy Rules:**
1. No data persistence beyond session
2. No user data on servers
3. All API tokens ephemeral
4. NSFW content encrypted in transit

---

## Validation Scripts

All scripts located in `/scripts/` directory and executable via npm scripts.

### Mock-Real Parity (`validate-mock-real-parity.ts`)

```bash
npm run validate:mock-real-parity
```

**Purpose:** Ensures every Real implementation has a Mock

**Output:**
- List of valid Mock-Real pairs
- Missing Mocks
- Orphaned Mocks

**Fails if:** Real implementation exists without corresponding Mock

---

### Top-Level Comments (`validate-comments.ts`)

```bash
npm run validate:comments
```

**Purpose:** Validates WHAT/WHY/HOW documentation in all TS files

**Required Format:**
```typescript
/**
 * WHAT: Brief description of what this file does
 * WHY: Why this file exists / problem it solves
 * HOW: High-level approach or architecture notes
 */
```

**Output:**
- Files with complete documentation
- Files missing WHAT/WHY/HOW
- Suggestions for compliance

---

### God Classes (`validate-god-classes.ts`)

```bash
npm run validate:god-classes
```

**Purpose:** Detects classes with >3 responsibilities

**Heuristic:**
- Base: 1 responsibility
- +1 per 5 methods
- +1 per 10 properties

**Flags if:**
- Estimated responsibilities > 3
- Method count > 15

**Output:**
- Class name and file
- Method count
- Property count
- Estimated responsibilities

---

### Naming Conventions (`validate-naming.ts`)

```bash
npm run validate:naming
```

**Purpose:** Enforces SDD naming patterns

**Rules:**
- Interfaces: `I*.ts` with `interface I*` name
- Mocks: `*Mock*.ts` or `*.mock.ts` with `class Mock*`
- Reals: `Real*` when Mock exists

**Output:**
- Naming violations
- Suggestions for compliance

---

### No Persistence (`validate-no-persistence.ts`)

```bash
npm run validate:no-persistence
```

**Purpose:** Prevents data persistence violations

**Detects:**
- `fs.write*` calls
- `localStorage.setItem` without expiration
- `IndexedDB` usage
- Database connections (MongoDB, PostgreSQL, Redis)
- Long-lived cookies

**Output:**
- File path and line number
- Issue description
- Code snippet

---

### CCR Calculation (`calculate-ccr.ts`)

```bash
npm run ccr:calculate
```

**Purpose:** Calculates Contract Compliance Rate

**Process:**
1. Load Mock test results
2. Load Real test results
3. Compare test names and outcomes
4. Calculate CCR = (matching tests) / (total tests)

**Output:**
- CCR score (0.0 to 1.0)
- Discrepancy details
- JSON report

**Interpretation:**
- CCR = 1.0: Perfect compliance ✅
- CCR ≥ 0.9: Good compliance ⚠️
- CCR < 0.9: Poor compliance ❌

---

## NPM Scripts Reference

### Testing
```bash
npm run test              # Run all tests
npm run test:ci           # CI-friendly verbose output
npm run test:coverage     # Run with coverage
npm run test:mock         # Run only Mock tests
npm run test:real         # Run only Real tests
npm run test:nsfw-filter  # Run NSFW filter tests
```

### Type Checking & Linting
```bash
npm run type-check        # TypeScript strict mode
npm run lint              # ESLint
npm run lint:no-any       # Enforce no 'any' types
npm run format            # Auto-format with Prettier
npm run format:check      # Check formatting
```

### SDD Validation
```bash
npm run validate:naming              # Check naming conventions
npm run validate:comments            # Check WHAT/WHY/HOW docs
npm run validate:mock-real-parity    # Check Mock-Real pairs
npm run validate:god-classes         # Detect God Classes
npm run validate:no-persistence      # Check privacy violations
npm run ccr:calculate                # Calculate CCR
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure GitHub Secrets (for Claude Code Review)

Go to: `Settings > Secrets and variables > Actions`

Add secret:
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** Your Claude API key

### 3. Run Local Validation

Before pushing:
```bash
cd client
npm run type-check
npm run lint
npm run test
npm run validate:mock-real-parity
npm run validate:comments
```

### 4. Create a Pull Request

- All workflows run automatically
- Review PR comments for validation results
- Use `@claude-code fix` for automated fixes

---

## Workflow Dependencies

```
PR Created
    ↓
┌───────────────────────────────────────┐
│  PR Validation                        │
│  - Tests, Lint, Type Check, Build    │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  Claude Code Review                   │
│  - AI-powered SDD review              │
│  - Automated fixes on @claude-code    │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  CCR Enforcement                      │
│  - Mock-Real parity                   │
│  - CCR calculation                    │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│  Security & Privacy                   │
│  - No persistence                     │
│  - Secret scanning                    │
│  - SAST analysis                      │
└───────────────────────────────────────┘
    ↓
All Green? → Ready to Merge ✅
```

---

## Troubleshooting

### Workflow Fails on Type Check
```bash
# Run locally:
npm run type-check

# Fix errors, then:
git add .
git commit -m "fix: type errors"
git push
```

### CCR < 1.0
```bash
# Check which tests differ:
npm run ccr:calculate

# Review ccr-report.json for details
# Fix Mock or Real implementation
# Re-run tests
```

### Claude Code Review Not Triggering
- Ensure `ANTHROPIC_API_KEY` secret is set
- Check workflow permissions (needs `contents: write`)
- Verify PR has changed files in `client/**`

### Validation Scripts Fail
```bash
# Missing dependencies:
npm install -D ts-node glob

# Script not executable:
chmod +x ../scripts/*.ts

# Run with ts-node directly:
npx ts-node ../scripts/validate-naming.ts
```

---

## Future Enhancements

### Planned
- [ ] Pre-commit hooks with Husky
- [ ] Automated CHANGELOG generation
- [ ] Interface JSDoc validation
- [ ] Ember AI tone validation
- [ ] CCR trend tracking and dashboards
- [ ] Performance regression detection
- [ ] Visual regression testing

### Under Consideration
- [ ] Auto-merge on perfect CCR
- [ ] Slack/Discord notifications
- [ ] Custom GitHub status checks
- [ ] SDD compliance badge

---

## References

- [SEAM-Driven Development Guide](../claude.md)
- [Project Roadmap](./projectroadmap.md)
- [Agent Personas](../agents.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Last Updated:** 2024-11-22

**Maintained By:** SDD Automation Team
