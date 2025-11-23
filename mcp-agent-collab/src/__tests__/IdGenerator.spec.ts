/**
 * CONTRACT TESTS for IIdGenerator
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockIdGenerator and RealIdGenerator must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { IIdGenerator } from '../contracts/IIdGenerator.js';

// Prevent "Your test suite must contain at least one test" error
describe('Contract Tests Export', () => {
  it('should export testIdGeneratorContract function', () => {
    expect(typeof testIdGeneratorContract).toBe('function');
  });
});

/**
 * Contract test suite
 * This function accepts a factory that creates an IIdGenerator implementation
 * It runs the full contract test suite against that implementation
 */
export function testIdGeneratorContract(
  implementationName: string,
  createGenerator: () => IIdGenerator
) {
  describe(`IIdGenerator Contract: ${implementationName}`, () => {
    let generator: IIdGenerator;

    beforeEach(() => {
      generator = createGenerator();
    });

    // ==================== BASIC CONTRACT TESTS ====================

    describe('Basic Functionality', () => {
      it('should return a string from generate()', () => {
        const id = generator.generate();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });

      it('should return different IDs on consecutive calls', () => {
        const id1 = generator.generate();
        const id2 = generator.generate();
        expect(id1).not.toBe(id2);
      });

      it('should return different IDs for multiple calls', () => {
        const id1 = generator.generate();
        const id2 = generator.generate();
        const id3 = generator.generate();
        const id4 = generator.generate();
        const id5 = generator.generate();

        expect(new Set([id1, id2, id3, id4, id5]).size).toBe(5);
      });
    });

    // ==================== UNIQUENESS GUARANTEE ====================

    describe('Uniqueness Guarantee', () => {
      it('should generate 100 unique IDs without collisions', () => {
        const ids = new Set<string>();

        for (let i = 0; i < 100; i++) {
          const id = generator.generate();
          expect(ids.has(id)).toBe(false);
          ids.add(id);
        }

        expect(ids.size).toBe(100);
      });

      it('should generate 1000 unique IDs without collisions', () => {
        const ids = new Set<string>();

        for (let i = 0; i < 1000; i++) {
          const id = generator.generate();
          ids.add(id);
        }

        // All 1000 IDs should be unique
        expect(ids.size).toBe(1000);
      });

      it('should maintain uniqueness within a single instance with many calls', () => {
        const ids = new Set<string>();

        // Generate many IDs from one instance
        for (let i = 0; i < 200; i++) {
          ids.add(generator.generate());
        }

        // Should have 200 unique IDs
        expect(ids.size).toBe(200);
      });
    });

    // ==================== FORMAT VALIDATION ====================

    describe('Format Validation', () => {
      it('should return non-empty strings', () => {
        for (let i = 0; i < 10; i++) {
          const id = generator.generate();
          expect(id).toBeTruthy();
          expect(id.length).toBeGreaterThan(0);
        }
      });

      it('should return printable strings without control characters', () => {
        for (let i = 0; i < 10; i++) {
          const id = generator.generate();
          // Should not contain common problematic characters
          expect(id).not.toMatch(/[\n\r\t\0]/);
        }
      });
    });
  });
}
