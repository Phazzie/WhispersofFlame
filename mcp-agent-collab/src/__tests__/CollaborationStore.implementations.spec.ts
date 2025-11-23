/**
 * Run contract tests against all ICollaborationStore implementations
 *
 * This file imports the contract test suite and runs it against:
 * 1. MockCollaborationStore
 * 2. InMemoryCollaborationStore
 *
 * If both pass, CCR = 1.0 (Contract Compliance Ratio is perfect)
 */

import { testCollaborationStoreContract } from './CollaborationStore.spec.js';
import { MockCollaborationStore } from '../mocks/MockCollaborationStore.js';
import { InMemoryCollaborationStore } from '../services/InMemoryCollaborationStore.js';

// Run contract tests against Mock implementation
testCollaborationStoreContract('MockCollaborationStore', () => new MockCollaborationStore());

// Run contract tests against Real implementation
testCollaborationStoreContract('InMemoryCollaborationStore', () => new InMemoryCollaborationStore());

/**
 * CCR Verification Test
 *
 * This test verifies that Mock and Real behave identically for complex scenarios.
 * If this passes, CCR = 1.0
 */
describe('CCR Verification: CollaborationStore', () => {
  it('Mock and Real should produce identical results for same operations', async () => {
    const mock = new MockCollaborationStore();
    const real = new InMemoryCollaborationStore();

    // Perform identical sequence of operations on both
    const review1 = {
      id: 'review-1',
      requestedBy: 'claude' as const,
      code: 'function test() {}',
      filePath: 'test.ts',
      context: 'Test',
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    const help1 = {
      id: 'help-1',
      requestedBy: 'copilot' as const,
      question: 'How?',
      context: 'Context',
      urgency: 'medium' as const,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    const task1 = {
      agent: 'claude' as const,
      task: 'Build feature',
      status: 'in_progress' as const,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    // Add to both
    await mock.addReviewRequest(review1);
    await real.addReviewRequest(review1);

    await mock.addHelpRequest(help1);
    await real.addHelpRequest(help1);

    await mock.updateTaskProgress(task1);
    await real.updateTaskProgress(task1);

    await mock.setContext('key1', 'value1');
    await real.setContext('key1', 'value1');

    // Verify identical results
    const mockReviews = await mock.getAllReviews();
    const realReviews = await real.getAllReviews();
    expect(mockReviews).toEqual(realReviews);

    const mockHelp = await mock.getAllHelp();
    const realHelp = await real.getAllHelp();
    expect(mockHelp).toEqual(realHelp);

    const mockTasks = await mock.getAllTasks();
    const realTasks = await real.getAllTasks();
    expect(mockTasks).toEqual(realTasks);

    const mockContext = await mock.getAllContext();
    const realContext = await real.getAllContext();
    expect(mockContext).toEqual(realContext);

    // CCR = 1.0 ✓
  });
});
