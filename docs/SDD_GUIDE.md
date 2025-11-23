<!--
WHAT: A beginner-friendly guide to Seam-Driven Development (SDD).
WHY: To onboard new developers (and AI agents) who are unfamiliar with the strict "Mock Everything" methodology.
HOW: By explaining the core concepts, the 4-step cycle, and providing a concrete example.
-->

# The Beginner's Guide to Seam-Driven Development (SDD)

Welcome to the architectural philosophy of **Whispers of Flame**. If you are new here, you might find our process strict, perhaps even rigid. This is intentional.

**Seam-Driven Development (SDD)** is a methodology designed to eliminate "Spaghetti Code" and ensure that every part of our system works perfectly in isolation before it is ever connected to the whole.

---

## 1. The Core Concept: "The Car Factory"

Imagine building a car. You wouldn't weld the engine directly to the wheels. You wouldn't build the radio inside the dashboard so it can never be removed.

Instead, you build **Seams** (connection points).
*   The engine connects to the transmission via a specific bolt pattern.
*   The radio connects to the dashboard via a standard plug.

Because of these Seams, you can:
1.  Test the engine on a stand without the car.
2.  Swap the radio for a better one without cutting wires.
3.  Replace the wheels with skis without rebuilding the axle.

**SDD treats software exactly like this.** We don't write one big program. We build small, isolated components (Services) that connect via strict rules (Contracts).

---

## 2. The Golden Rules

### Rule #1: Contracts First
Before writing a single line of logic, we define the **Interface** (The Contract). This is the "bolt pattern." It defines exactly what inputs a component takes and what outputs it gives.

### Rule #2: Mock Everything
Every component must have a **Mock** (a fake version) that behaves exactly like the real thing.
*   **Why?** So we can build the UI before the Backend is ready. So we can test the "Game Over" screen without playing for 2 hours.

### Rule #3: Tests are the Truth
We write tests against the **Contract**, not the implementation. If the Mock passes the test, and the Real code passes the test, they are interchangeable.

---

## 3. The SDD Workflow (The 4 Steps)

We follow a strict "Waterfall" for every single component.

### Step 1: Define the Seam (The Interface)
We write a TypeScript Interface (`IWeatherService.ts`).
```typescript
// IWeatherService.ts
export interface IWeatherService {
  getTemperature(city: string): Promise<number>;
}
```

### Step 2: Write the Test (The Exam)
We write a test that fails (`weather.service.spec.ts`). This is the "Red" state.
```typescript
// weather.service.spec.ts
it('should return 20 for London', async () => {
  const temp = await service.getTemperature('London');
  expect(temp).toBe(20);
});
```

### Step 3: Build the Mock (The Simulator)
We build a fake version that passes the test (`MockWeatherService.ts`). This is the "Green (Mock)" state.
```typescript
// MockWeatherService.ts
export class MockWeatherService implements IWeatherService {
  async getTemperature(city: string): Promise<number> {
    return 20; // Hardcoded, but it passes the test!
  }
}
```

### Step 4: Build the Real Thing (The Engine)
Finally, we build the real logic (`RealWeatherService.ts`). This is the "Green (Real)" state.
```typescript
// RealWeatherService.ts
export class RealWeatherService implements IWeatherService {
  async getTemperature(city: string): Promise<number> {
    const response = await fetch(`api.weather.com/${city}`);
    return response.json().temp;
  }
}
```

---

## 4. The Metric: Contract Compliance Rate (CCR)

How do we know if the Mock and the Real code are actually the same?
We calculate the **CCR**.

*   We run the **same test suite** against the Mock.
*   We run the **same test suite** against the Real code.
*   If both pass 100% of the tests, **CCR = 1.0**.

**We do not ship code until CCR = 1.0.**

---

## 5. Why do we do this?

1.  **Speed**: The Frontend team can build the entire UI using Mocks while the Backend team figures out the database.
2.  **Stability**: If a bug appears, we can switch to the Mock. If the bug disappears, we know the issue is in the Real service. If it stays, the issue is in the UI.
3.  **AI-Friendliness**: AI agents (like Claude and Copilot) thrive on small, well-defined tasks. "Implement this Interface to pass this Test" is a perfect prompt.

---

## Summary

1.  **Define** the Interface.
2.  **Test** the Interface.
3.  **Mock** the Interface.
4.  **Implement** the Interface.

Welcome to **Whispers of Flame**. Let's build something world-class.
