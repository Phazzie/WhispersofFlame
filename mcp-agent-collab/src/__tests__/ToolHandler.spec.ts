/**
 * CONTRACT TESTS for IToolHandler
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockToolHandler and ToolHandler must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { IToolHandler } from '../contracts/IToolHandler.js';
import { testToolHandlerContract } from './helpers/contracts.js';

// Prevent "Your test suite must contain at least one test" error
describe('Contract Tests Export', () => {
  it('should export testToolHandlerContract function', () => {
    expect(typeof testToolHandlerContract).toBe('function');
  });
});

/**
 * Contract test suite
 * This function accepts a factory that creates an IToolHandler implementation
 * It runs the full contract test suite against that implementation
 */
export { testToolHandlerContract };
