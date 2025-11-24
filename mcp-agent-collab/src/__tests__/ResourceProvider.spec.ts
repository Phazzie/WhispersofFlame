/**
 * CONTRACT TESTS for IResourceProvider
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockResourceProvider and ResourceProvider must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { IResourceProvider } from '../contracts/IResourceProvider.js';
import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';
import { testResourceProviderContract } from './helpers/contracts.js';

// Prevent "Your test suite must contain at least one test" error
describe('Contract Tests Export', () => {
  it('should export testResourceProviderContract function', () => {
    expect(typeof testResourceProviderContract).toBe('function');
  });
});

/**
 * Contract test suite
 * This function accepts a factory that creates an IResourceProvider implementation
 * It runs the full contract test suite against that implementation
 */
export { testResourceProviderContract };
