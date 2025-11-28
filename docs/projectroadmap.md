<!--
WHAT: This document outlines the step-by-step execution plan for building "Whispers of Flame".
WHY: To ensure a disciplined, Seam-Driven Development (SDD) process where every component is verified before moving to the next.
HOW: By breaking down the project into granular phases, strictly following the sequence: Contracts -> Tests -> Mocks -> Implementation.
-->

# Project Roadmap - Whispers of Flame

This roadmap follows a **Strict SDD Waterfall** methodology.
**Rule**: We do not move to the next Phase until **ALL** items in the current Phase are complete.

## Phase 1: Foundation & Governance (The Setup)
- [x] **Project Initialization**
    - [x] Define PRD and Core Requirements.
    - [x] Establish Governance Docs (`copilot-instructions.md`, `claude.md`, `gemini.md`).
    - [x] Define Agent Personas (`agents.md`).
    - [x] Create Documentation Structure (`docs/`).
- [x] **Tech Stack Skeleton**
    - [x] Initialize Repository (Git).
    - [x] Set up Monorepo/Project Structure (Angular 21 client).
    - [x] Configure Tooling (ESLint, Prettier, Vitest, Zod).
    - [x] Set up CI/CD Pipeline (GitHub Actions - PR validation, CCR checks, Claude review).

## Phase 2: The Architect's Blueprint (All Contracts)
*Goal: Define the shape of the ENTIRE system before writing logic.*

- [x] **Seam 1: Domain Models (Shared Types)**
    - [x] Define `types/Game.ts` (Room, Player, SpicyLevel, GameStep).
    - [x] Define `types/User.ts` (Profile, AuthState).
    - [x] Define `types/AI.ts` (PromptRequest, AIResponse, Persona).
- [x] **Seam 2: Service Contracts (Interfaces)**
    - [x] Define `IAuthService.ts` (Login, Session, Anonymity).
    - [x] Define `IGameStateService.ts` (Create Room, Join, Update State).
    - [x] Define `IAIService.ts` (Generate Question, Summary, Notes).
    - [x] Define `IPersistenceService.ts` (DB Abstraction).

## Phase 3: The Tester's Gauntlet (All Tests)
*Goal: Write the test suite for the entire application. All tests must fail (Red).*

- [x] **Service Tests**
    - [x] Write `AuthService.spec.ts`.
    - [x] Write `GameStateService.spec.ts`.
    - [x] Write `AIService.spec.ts`.
    - [x] Write `PersistenceService.spec.ts`.

## Phase 4: The Simulation (All Mocks)
*Goal: Implement Mocks to make all tests pass (Green - Mock).*

- [x] **Service Mocks**
    - [x] Implement `MockAuthService.ts`.
    - [x] Implement `MockGameStateService.ts`.
    - [x] Implement `MockAIService.ts`.
    - [x] Implement `MockPersistenceService.ts`.
- [x] **Verification**
    - [x] Verify Contract Compliance Rate (CCR) = 1.0 for all Mocks.

## Phase 5: The Reality (All Implementations)
*Goal: Replace Mocks with Real logic one by one (Green - Real).*

- [x] **Service Implementations**
    - [x] Implement `RealPersistenceService.ts` (DB Connection).
    - [x] Implement `RealAIService.ts` (Grok-4 Integration).
    - [x] Implement `RealAuthService.ts` (OAuth/Session).
    - [x] Implement `RealGameStateService.ts` (Core Logic).
- [x] **Verification**
    - [x] Verify CCR = 1.0 for all Real implementations.

## Phase 6: The Gateway (API Layer)
*Goal: Expose the Services via secure endpoints.*
*Note: Skipped for MVP - using direct service injection in Angular. API layer can be added later for mobile/external clients.*

- [x] **API Definition & Implementation** (DEFERRED)
    - [x] ~~Define API Routes~~ → Using direct service DI instead
    - [x] ~~Implement Route Handlers~~ → Services injected directly
    - [x] Zod Validation (in Real service implementations)
    - [x] ~~Integration Tests~~ → Service contract tests cover this

## Phase 7: The Experience (Frontend)
*Goal: A beautiful, responsive UI that consumes the API.*

- [x] **UI Component Library**
    - [x] Setup Tailwind CSS Theme.
    - [x] Build Atoms (Button, Input, Card, Loader).
- [x] **Feature Implementation**
    - [x] Lobby & Onboarding.
    - [x] Game Loop (Question/Answer/Reveal).
    - [x] Summary & Insights.

## Phase 8: Polish & Launch
*Goal: Production readiness.*

- [ ] **Final Checks**
    - [ ] Security Audit (input validation, XSS protection, auth flows).
    - [ ] Performance Tuning (bundle size, lazy loading, Lighthouse audit).
    - [ ] User Acceptance Testing (UAT).
    - [ ] Environment Configuration (OpenRouter API key, Netlify Identity).
    - [ ] Launch (deploy to Netlify/Vercel).

## Phase 9: Bonus - MCP Agent Collaboration (Complete)
*Goal: Enable AI agents to collaborate on development.*

- [x] **MCP Server Implementation**
    - [x] Define 4 Seams (ICollaborationStore, IIdGenerator, IToolHandler, IResourceProvider).
    - [x] Implement 8 collaboration tools (review, help, progress, coordination).
    - [x] Implement 5 MCP resources (tasks, reviews, help, coordination, context).
    - [x] 185 tests passing, CCR = 1.0.
    - [x] Documentation (MCPINFO.md).

---
**Legend:**
- [ ] To Do
- [/] In Progress
- [x] Done
