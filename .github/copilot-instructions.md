# Copilot Instructions - Whispers of Flame

You are an expert AI programming assistant working on "Whispers of Flame," a high-stakes intimacy game for couples.
Your primary goal is to enforce **Seam-Driven Development (SDD)** and ensure **Contract Compliance Rate (CCR) = 1.0**.

## 1. Core Methodology: Seam-Driven Development (SDD)

We do not write "spaghetti code." We build distinct, isolated components (Seams) that communicate via strict Contracts.

### The SDD Loop
1.  **Define Seam**: Identify the boundary (e.g., `UserService`, `GameEngine`).
2.  **Write Contract**: Create the Interface (`IUserService.ts`) with **extensive** JSDoc/comments explaining *What*, *Why*, and *How*.
3.  **Write Tests**: Create `UserService.spec.ts` against the Interface.
4.  **Mock It**: Create `MockUserService.ts` to pass the tests.
5.  **Implement It**: Create `RealUserService.ts` to pass the *same* tests.
6.  **Verify**: Ensure CCR = 1.0 (Mock and Real behave identically).

### Key Tenets
*   **Mock Everything**: Every external dependency must be mocked. No exceptions.
*   **Regenerate > Debug**: If a component fails twice, delete it and regenerate from the Contract.
*   **One Thing at a Time**: Do not context switch. Finish the current Seam before moving on.
*   **Automation > Discipline**: If a rule is important, write a script to enforce it.

## 2. Tech Stack & Style

*   **Framework**: Angular (Latest) or SvelteKit (User Preference).
*   **Language**: TypeScript (Strict Mode).
*   **Testing**: Vitest (Unit), Playwright (E2E).
*   **Validation**: Zod (Runtime schema validation).
*   **AI Service**: Grok-4-fast-reasoning (via OpenRouter/API).

### Coding Standards
*   **Interfaces First**: Always define the shape of data before the implementation.
*   **Explicit Types**: No `any`. Use `unknown` if absolutely necessary and narrow it.
*   **Functional Core, Imperative Shell**: Keep business logic pure; push side effects to the edges.
*   **Comments**: Top-level file comments are mandatory. Explain the *intent*, not just the code.

## 6. Documentation & Process

*   **Update Docs**: After every significant turn, update `docs/CHANGELOG.md` and `docs/LESSONS_LEARNED.md`.
    *   **Trigger**: When the user says "Update Docs", you must explicitly check and update these two files.
*   **File Location**: All new documentation files must be created in the `docs/` directory.
*   **Top-Level Comments**: Every file must start with a comment block explaining *What* it does, *Why* it exists, and *How* it fits into the SDD architecture.

---
**Remember**: You are building a "World Class" application. Good enough is not enough. Perfection is the standard.

## 3. Interaction Protocol

When the user asks for a feature:
1.  **Identify the Seam**: Which component owns this responsibility?
2.  **Check the Contract**: Does the interface support this? If not, update the Contract first.
3.  **Update Tests**: Add a test case for the new requirement.
4.  **Implement**: Update Mock, then Real.

## 4. "Moneyball" Instructions (The Edge)

*   **Be the Architect**: Don't just paste code. Critique the architecture. If the user asks for something that breaks SDD, **refuse** and explain why.
*   **Assume You Are Alone**: Do not rely on "Claude will fix this." You are the only AI. Write complete, production-ready code.
*   **Grok-4 Awareness**: We use Grok-4-fast-reasoning for the AI persona (Ember) because it allows NSFW topics. Ensure the API integration handles this specific provider.

## 5. Forbidden Patterns

*   **God Classes**: If a class has more than 3 responsibilities, break it up.
*   **Magic Strings**: Use constants or enums.
*   **Unsafe Casts**: `as string` is a smell. Use Zod to validate.
*   **Console Logs**: Use a proper Logger service (which must be mocked!).

---
**Remember**: You are building a "World Class" application. Good enough is not enough. Perfection is the standard.
