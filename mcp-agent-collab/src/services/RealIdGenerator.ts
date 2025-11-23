/**
 * REAL IMPLEMENTATION: ID Generator
 *
 * Purpose: Production-ready truly unique ID generation
 * Use cases:
 *   - Production MCP server
 *   - Any context requiring truly unique IDs
 *   - High-throughput ID generation
 *
 * Behavior:
 *   - Generates unique IDs using timestamp + random string
 *   - Format: "${Date.now()}-${randomString}"
 *   - Collision-resistant: timestamp (13 digits) + 9 random base36 chars
 *   - Must pass identical contract tests as mock implementation (CCR = 1.0)
 */

import type { IIdGenerator } from '../contracts/IIdGenerator.js';

export class RealIdGenerator implements IIdGenerator {
  /**
   * Generate a truly unique ID using timestamp and randomness
   * Format: "{timestamp}-{randomString}"
   * Example: "1700000000000-a1b2c3d4e"
   * @returns A unique ID string
   */
  generate(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${randomString}`;
  }
}
