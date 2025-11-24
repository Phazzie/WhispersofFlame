<!--
WHAT: This document catalogues the architectural Seams (boundaries) of the application.
WHY: To strictly define where responsibilities start and end, enabling independent testing and mocking.
HOW: By categorizing every component into Boundary, Transformation, Coordination, or Presentation.
-->

# Seam Catalogue - Whispers of Flame

## 1. Boundary Seams (The Edges)
*Components that interact with the outside world (Users, APIs, DBs).*

- **`IAIService`**
    - **Responsibility**: Handles all communication with the Grok-4 API.
    - **Inputs**: Prompt templates, context data.
    - **Outputs**: Raw text responses (sanitized).
    - **Risk**: High (External dependency, rate limits, latency).
    - **Mock Strategy**: Deterministic responses based on seed.

- **`IPersistenceService`**
    - **Responsibility**: Abstract interface for data storage (DB/Cache).
    - **Inputs**: Game objects, User profiles.
    - **Outputs**: Success/Failure, Data retrieval.
    - **Risk**: Medium (Data integrity, race conditions).
    - **Mock Strategy**: In-Memory Map.

- **`IAuthService`**
    - **Responsibility**: Manages user identity and sessions.
    - **Inputs**: Credentials, Tokens.
    - **Outputs**: User Profile, Auth Tokens.
    - **Risk**: High (Security).
    - **Mock Strategy**: Mock tokens, bypass providers.

## 2. Transformation Seams (The Brains)
*Pure logic components. No side effects. Input -> Output.*

- **`IEmberEngine`** (Question Logic)
    - **Responsibility**: Selects or generates the next question based on game state and spicy level.
    - **Inputs**: Current Category, Spicy Level, History.
    - **Outputs**: Question string.
    - **Risk**: Medium (Content quality).

- **`IScribeEngine`** (Summary Logic)
    - **Responsibility**: Compiles session data into a narrative summary.
    - **Inputs**: Q&A pairs, Themes.
    - **Outputs**: Summary text, Therapist notes.

## 3. Coordination Seams (The Nervous System)
*Components that manage state and orchestrate other seams.*

- **`IGameStateService`**
    - **Responsibility**: The "God" of the game session. Manages the state machine (Lobby -> Question -> Reveal).
    - **Inputs**: User Actions (Vote, Answer, Next).
    - **Outputs**: New Game State.
    - **Risk**: High (State desync).

## 4. Presentation Seams (The Face)
*UI Components and View Logic.*

- **`GameClient`** (Angular App)
    - **Responsibility**: Rendering state, capturing input.
    - **Inputs**: Game State Observables.
    - **Outputs**: DOM Events.
