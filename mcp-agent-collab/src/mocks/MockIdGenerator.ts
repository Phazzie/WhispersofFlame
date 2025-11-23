/**
 * MOCK IMPLEMENTATION: IdGenerator
 *
 * Purpose: Fast, predictable ID generation for testing
 * Use cases:
 *   - Unit tests that need deterministic IDs
 *   - Fast CI/CD pipeline tests
 *   - Development without real infrastructure
 *
 * Behavior:
 *   - Generates sequential IDs in format "mock-id-1", "mock-id-2", etc.
 *   - Predictable and easy to debug
 *   - Must pass identical contract tests as real implementation (CCR = 1.0)
 */

import type { IIdGenerator } from '../contracts/IIdGenerator.js';

export class MockIdGenerator implements IIdGenerator {
  private counter: number = 0;

  /**
   * Generate a predictable mock ID
   * Format: "mock-id-{counter}"
   * @returns A unique mock ID string
   */
  generate(): string {
    this.counter++;
    return `mock-id-${this.counter}`;
  }
}
