/**
 * CONTRACT TESTS for ICollaborationStore
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockCollaborationStore and InMemoryCollaborationStore must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';
import { testCollaborationStoreContract } from './helpers/contracts.js';

// Prevent "Your test suite must contain at least one test" error
describe('Contract Tests Export', () => {
  it('should export testCollaborationStoreContract function', () => {
    expect(typeof testCollaborationStoreContract).toBe('function');
  });
});

/**
 * Contract test suite
 * This function accepts a factory that creates an ICollaborationStore implementation
 * It runs the full contract test suite against that implementation
 */
export { testCollaborationStoreContract };
