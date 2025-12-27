# TODO: Deployment & Improvement Plan

This document outlines the necessary steps to prepare the "Whispers of Flame" application for deployment, fix critical bugs, and improve the overall system architecture.

## 🚨 Critical Fixes (Pre-Deployment)

- [x] **Fix SQL Injection in `netlify/functions/room-update.ts`**
  - **Details:** The SQL injection vulnerability has been fixed by using parameterized queries (tagged templates).

- [ ] **Apply Database Schema**
  - **Details:** The database schema in `database/schema.sql` must be applied to the Neon PostgreSQL instance.
  - **Action:** Run `npm run setup:neon` (ensure `NEON_DATABASE_URL` is set).

- [ ] **Address Race Condition in `netlify/functions/room-create.ts`**
  - **Details:** There is a small window where a generated room code could collide with an existing one between the check and the insert.
  - **Action:** Use `INSERT ... ON CONFLICT DO NOTHING` and retry logic instead of a separate SELECT check.

- [ ] **Fix N+1 Query in `netlify/functions/room-get.ts`**
  - **Details:** The endpoint performs separate queries for the room, players, question, and answers.
  - **Action:** Refactor to use a single SQL query with `JOIN`s and `json_agg` to fetch all data in one round-trip.

- [ ] **Environment Configuration**
  - **Details:** Ensure `NEON_DATABASE_URL`, `XAI_API_KEY`, and `ALLOWED_ORIGINS` are correctly set in the Netlify dashboard.

## 🛠 Improvements & Optimizations

- [ ] **Optimize `netlify/functions/room-sync.ts`**
  - **Details:** While currently efficient, adding `Cache-Control` headers or optimizing the query plan for the `game_events` table could further improve performance.

- [ ] **Improve `netlify/functions/player-ready.ts`**
  - **Details:** Combine the two separate `UPDATE` queries (one for ready status, one for last seen) into a single query to reduce database round-trips.

- [ ] **Frontend: Robust Polling in `client/src/app/services/real-sync.service.ts`**
  - **Details:** Implement exponential backoff for polling in case of network errors to avoid hammering the server when it's down.

- [ ] **Frontend: Connection Pooling**
  - **Details:** While Neon serverless handles this well, explicit configuration for connection caching in the backend functions can improve cold start times.

## 🚀 Proposed System Architecture: "Real-Time Robust"

To make the system more accurate, reliable, and "game-like", we should move away from simple polling to a more event-driven architecture suitable for serverless.

### 1. Real-Time Layer (WebSockets via Managed Service)
*   **Problem:** Polling every 2 seconds introduces latency and unnecessary database load. Netlify Functions cannot hold long-lived WebSocket connections.
*   **Solution:** Integrate a service like **Pusher** or **Ably**.
    *   **Flow:**
        1.  Client performs an action (e.g., `POST /room-update`).
        2.  Function updates DB.
        3.  Function publishes an event (e.g., `room-updated`) to a channel `room-{roomCode}` via Pusher/Ably API.
        4.  All connected clients receive the event instantly via WebSocket.
    *   **Benefit:** Sub-100ms latency, reduced DB read load (no more polling).

### 2. State Management & Optimistic UI
*   **Problem:** Users wait for the server to confirm actions.
*   **Solution:** Implement Optimistic UI updates in Angular.
    *   When a user clicks "Ready", update the UI immediately to "Ready".
    *   Send the request in the background.
    *   If the request fails, revert the UI state and show an error.
    *   Use a state management library (like Akita or NgRx Component Store) to manage the game state locally.

### 3. Idempotency & Conflict Resolution
*   **Problem:** What if two requests are sent? What if two players answer at the exact same time?
*   **Solution:**
    *   **Version Control:** Add a `version` column to the `rooms` table. Every update must increment the version. If the client sends an update with an old version, reject it.
    *   **Idempotency Keys:** Clients generate a unique UUID for every action (e.g., "submit answer"). If the server receives the same UUID twice, it ignores the second one but returns success.

### 4. Reliability Enhancements
*   **Connection State:** Display a "Reconnecting..." badge if the WebSocket/Network drops.
*   **Session Recovery:** Store the `playerId` and `roomCode` in `localStorage`. If the user refreshes, automatically reconnect them to the room. (Already partially implemented, needs robustness).

## 📝 Implementation Plan for "Real-Time Robust"

1.  **Phase 1 (Current):** Fix critical bugs (SQL Injection, N+1 queries).
2.  **Phase 2 (Optimization):** Optimize current polling (backoff, query tuning).
3.  **Phase 3 (Real-Time):**
    *   Sign up for Pusher/Ably (Free tier is usually sufficient for small scale).
    *   Add `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` to env vars.
    *   Install backend SDK in Netlify functions.
    *   Install frontend SDK in Angular client.
    *   Modify all "write" functions (`room-update`, `player-ready`, etc.) to trigger a Pusher event after DB update.
    *   Replace `RealSyncService` polling with Pusher subscription.
