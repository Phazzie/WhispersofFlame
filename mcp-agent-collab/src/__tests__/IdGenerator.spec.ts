/**
 * CONTRACT TESTS for IIdGenerator
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockIdGenerator and RealIdGenerator must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { IIdGenerator } from '../contracts/IIdGenerator.js';
import { testIdGeneratorContract } from './helpers/contracts.js';

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
export { testIdGeneratorContract };
