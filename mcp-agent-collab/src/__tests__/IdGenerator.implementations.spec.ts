/**
 * Run contract tests against all IIdGenerator implementations
 *
 * This file imports the contract test suite and runs it against:
 * 1. MockIdGenerator
 * 2. RealIdGenerator
 *
 * If both pass, CCR = 1.0 (Contract Compliance Ratio is perfect)
 */

import { testIdGeneratorContract } from './IdGenerator.spec.js';
import { MockIdGenerator } from '../mocks/MockIdGenerator.js';
import { RealIdGenerator } from '../services/RealIdGenerator.js';

// Run contract tests against Mock implementation
testIdGeneratorContract('MockIdGenerator', () => new MockIdGenerator());

// Run contract tests against Real implementation
testIdGeneratorContract('RealIdGenerator', () => new RealIdGenerator());

/**
 * CCR Verification Test
 *
 * This test verifies that Mock and Real behave identically for the contract.
 * If this passes, CCR = 1.0
 */
describe('CCR Verification: IdGenerator', () => {
  it('Mock and Real should both satisfy the uniqueness guarantee', () => {
    const mock = new MockIdGenerator();
    const real = new RealIdGenerator();

    const mockIds = new Set<string>();
    const realIds = new Set<string>();

    // Generate 500 IDs from each
    for (let i = 0; i < 500; i++) {
      mockIds.add(mock.generate());
      realIds.add(real.generate());
    }

    // Both should produce 500 unique IDs
    expect(mockIds.size).toBe(500);
    expect(realIds.size).toBe(500);

    // No overlap between mock and real IDs
    const combined = new Set([...mockIds, ...realIds]);
    expect(combined.size).toBe(1000);
  });

  it('Both implementations should return strings from generate()', () => {
    const mock = new MockIdGenerator();
    const real = new RealIdGenerator();

    for (let i = 0; i < 10; i++) {
      expect(typeof mock.generate()).toBe('string');
      expect(typeof real.generate()).toBe('string');
    }
  });

  it('Both implementations should never return the same ID twice', () => {
    const mock = new MockIdGenerator();
    const real = new RealIdGenerator();

    const mockIds = new Set<string>();
    const realIds = new Set<string>();

    // Generate 100 IDs from each
    for (let i = 0; i < 100; i++) {
      const mockId = mock.generate();
      const realId = real.generate();

      // Should not have seen these before
      expect(mockIds.has(mockId)).toBe(false);
      expect(realIds.has(realId)).toBe(false);

      mockIds.add(mockId);
      realIds.add(realId);
    }

    // CCR = 1.0 ✓
  });
});
