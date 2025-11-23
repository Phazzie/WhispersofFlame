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
- [ ] **Tech Stack Skeleton**
    - [ ] Initialize Repository (Git).
    - [ ] Set up Monorepo/Project Structure (Angular/SvelteKit + Node/Edge API).
    - [ ] Configure Tooling (ESLint, Prettier, Vitest, Zod).
    - [ ] Set up CI/CD Pipeline (GitHub Actions - Run Tests on PR).

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

- [ ] **Service Tests**
    - [ ] Write `AuthService.spec.ts`.
    - [ ] Write `GameStateService.spec.ts`.
    - [ ] Write `AIService.spec.ts`.
    - [ ] Write `PersistenceService.spec.ts`.

## Phase 4: The Simulation (All Mocks)
*Goal: Implement Mocks to make all tests pass (Green - Mock).*

- [ ] **Service Mocks**
    - [ ] Implement `MockAuthService.ts`.
    - [ ] Implement `MockGameStateService.ts`.
    - [ ] Implement `MockAIService.ts`.
    - [ ] Implement `MockPersistenceService.ts`.
- [ ] **Verification**
    - [ ] Verify Contract Compliance Rate (CCR) = 1.0 for all Mocks.

## Phase 5: The Reality (All Implementations)
*Goal: Replace Mocks with Real logic one by one (Green - Real).*

- [ ] **Service Implementations**
    - [ ] Implement `RealPersistenceService.ts` (DB Connection).
    - [ ] Implement `RealAIService.ts` (Grok-4 Integration).
    - [ ] Implement `RealAuthService.ts` (OAuth/Session).
    - [ ] Implement `RealGameStateService.ts` (Core Logic).
- [ ] **Verification**
    - [ ] Verify CCR = 1.0 for all Real implementations.

## Phase 6: The Gateway (API Layer)
*Goal: Expose the Services via secure endpoints.*

- [ ] **API Definition & Implementation**
    - [ ] Define API Routes (OpenAPI/Swagger).
    - [ ] Implement Route Handlers (connecting to Real Services).
    - [ ] Add Zod Validation Middleware.
    - [ ] Integration Tests.

## Phase 7: The Experience (Frontend)
*Goal: A beautiful, responsive UI that consumes the API.*

- [ ] **UI Component Library**
    - [ ] Setup Tailwind CSS Theme.
    - [ ] Build Atoms (Button, Input, Card, Loader).
- [ ] **Feature Implementation**
    - [ ] Lobby & Onboarding.
    - [ ] Game Loop (Question/Answer/Reveal).
    - [ ] Summary & Insights.

## Phase 8: Polish & Launch
*Goal: Production readiness.*

- [ ] **Final Checks**
    - [ ] Security Audit.
    - [ ] Performance Tuning.
    - [ ] User Acceptance Testing (UAT).
    - [ ] Launch.

---
**Legend:**
- [ ] To Do
- [/] In Progress
- [x] Done
