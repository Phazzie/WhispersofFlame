/**
 * SEAM: ID Generation
 *
 * WHY: Decouple ID generation strategy from business logic.
 *      Makes testing easier (predictable IDs in tests).
 *      Allows different ID strategies (UUID, timestamp-based, sequential, etc.)
 *
 * WHAT: Generates unique identifiers for entities (reviews, help requests, etc.)
 *
 * HOW: Provides a single method that returns a unique string ID.
 *      Implementation can use timestamps, UUIDs, counters, etc.
 *
 * CONTRACT COMPLIANCE:
 *   - MockIdGenerator returns predictable IDs (e.g., "mock-id-1", "mock-id-2")
 *   - RealIdGenerator returns truly unique IDs (timestamp-based or UUID)
 *   - Both must satisfy uniqueness guarantee
 */

export interface IIdGenerator {
  /**
   * Generate a unique ID
   * @returns A unique string identifier
   *
   * GUARANTEE: Each call must return a different ID.
   * No two calls should ever return the same ID within a single process.
   */
  generate(): string;
}
