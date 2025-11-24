/**
 * Run contract tests against all IResourceProvider implementations
 *
 * This file imports the contract test suite and runs it against:
 * 1. MockResourceProvider
 * 2. ResourceProvider
 *
 * If both pass, CCR = 1.0 (Contract Compliance Ratio is perfect)
 */

import { testResourceProviderContract } from './ResourceProvider.spec.js';
import { MockResourceProvider } from '../mocks/MockResourceProvider.js';
import { ResourceProvider } from '../services/ResourceProvider.js';
import { MockCollaborationStore } from '../mocks/MockCollaborationStore.js';
import { InMemoryCollaborationStore } from '../services/InMemoryCollaborationStore.js';
import type { IResourceProvider } from '../contracts/IResourceProvider.js';
import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';

// Run contract tests against Mock implementation
testResourceProviderContract(
  'MockResourceProvider',
  (store: ICollaborationStore) => new MockResourceProvider(store),
  () => new MockCollaborationStore()
);

// Run contract tests against Real implementation
testResourceProviderContract(
  'ResourceProvider',
  (store: ICollaborationStore) => new ResourceProvider(store),
  () => new InMemoryCollaborationStore()
);

/**
 * CCR Verification Test
 *
 * This test verifies that Mock and Real behave identically for complex scenarios.
 * If this passes, CCR = 1.0
 */
describe('CCR Verification: ResourceProvider', () => {
  it('Mock and Real should produce identical results for same store state', async () => {
    const mockStore = new MockCollaborationStore();
    const realStore = new InMemoryCollaborationStore();

    const mockProvider = new MockResourceProvider(mockStore);
    const realProvider = new ResourceProvider(realStore);

    // Populate both stores with identical data
    const task1 = {
      agent: 'claude' as const,
      task: 'Implement feature',
      status: 'in_progress' as const,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    const review1 = {
      id: 'review-1',
      requestedBy: 'claude' as const,
      code: 'function test() {}',
      filePath: 'test.ts',
      context: 'Test review',
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    const help1 = {
      id: 'help-1',
      requestedBy: 'copilot' as const,
      question: 'How to test?',
      context: 'Test context',
      urgency: 'medium' as const,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    const plan1 = {
      id: 'plan-1',
      initiatedBy: 'claude' as const,
      tasks: [
        { assignedTo: 'claude' as const, description: 'Frontend', priority: 1 },
        { assignedTo: 'copilot' as const, description: 'Backend', priority: 2 },
      ],
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    // Add to both stores
    await mockStore.updateTaskProgress(task1);
    await realStore.updateTaskProgress(task1);

    await mockStore.addReviewRequest(review1);
    await realStore.addReviewRequest(review1);

    await mockStore.addHelpRequest(help1);
    await realStore.addHelpRequest(help1);

    await mockStore.addCoordinationPlan(plan1);
    await realStore.addCoordinationPlan(plan1);

    await mockStore.setContext('api_key', 'secret123');
    await realStore.setContext('api_key', 'secret123');

    // Get resources from both providers
    const mockTasks = await mockProvider.getTasks();
    const realTasks = await realProvider.getTasks();
    expect(mockTasks.text).toEqual(realTasks.text);
    expect(mockTasks.uri).toEqual(realTasks.uri);

    const mockReviews = await mockProvider.getReviews();
    const realReviews = await realProvider.getReviews();
    expect(mockReviews.text).toEqual(realReviews.text);
    expect(mockReviews.uri).toEqual(realReviews.uri);

    const mockHelp = await mockProvider.getHelp();
    const realHelp = await realProvider.getHelp();
    expect(mockHelp.text).toEqual(realHelp.text);
    expect(mockHelp.uri).toEqual(realHelp.uri);

    const mockCoord = await mockProvider.getCoordination();
    const realCoord = await realProvider.getCoordination();
    expect(mockCoord.text).toEqual(realCoord.text);
    expect(mockCoord.uri).toEqual(realCoord.uri);

    const mockContext = await mockProvider.getContext();
    const realContext = await realProvider.getContext();
    expect(mockContext.text).toEqual(realContext.text);
    expect(mockContext.uri).toEqual(realContext.uri);

    // CCR = 1.0
  });

  it('Mock and Real should throw same error for unknown URIs', async () => {
    const mockStore = new MockCollaborationStore();
    const realStore = new InMemoryCollaborationStore();

    const mockProvider = new MockResourceProvider(mockStore);
    const realProvider = new ResourceProvider(realStore);

    const unknownUri = 'collab://state/invalid';

    await expect(mockProvider.getResource(unknownUri)).rejects.toThrow(
      `Unknown resource URI: ${unknownUri}`
    );
    await expect(realProvider.getResource(unknownUri)).rejects.toThrow(
      `Unknown resource URI: ${unknownUri}`
    );

    // Both throw identical error messages - CCR = 1.0
  });

  it('Mock and Real should handle complex nested context data identically', async () => {
    const mockStore = new MockCollaborationStore();
    const realStore = new InMemoryCollaborationStore();

    const mockProvider = new MockResourceProvider(mockStore);
    const realProvider = new ResourceProvider(realStore);

    const complexContext = {
      user: {
        id: '123',
        name: 'Test User',
        preferences: {
          theme: 'dark',
          notifications: true,
          settings: {
            timeout: 5000,
            retries: 3,
          },
        },
      },
      metadata: [1, 2, 3, 'four', { five: 5 }],
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    await mockStore.setContext('config', complexContext);
    await realStore.setContext('config', complexContext);

    const mockContextResource = await mockProvider.getContext();
    const realContextResource = await realProvider.getContext();

    expect(mockContextResource.text).toEqual(realContextResource.text);

    // Verify content is correct
    const parsed = JSON.parse(mockContextResource.text);
    expect(parsed.config).toEqual(complexContext);

    // CCR = 1.0
  });

  it('Mock and Real should preserve JSON formatting consistency', async () => {
    const mockStore = new MockCollaborationStore();
    const realStore = new InMemoryCollaborationStore();

    const mockProvider = new MockResourceProvider(mockStore);
    const realProvider = new ResourceProvider(realStore);

    const task = {
      agent: 'claude' as const,
      task: 'Test formatting',
      status: 'in_progress' as const,
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    await mockStore.updateTaskProgress(task);
    await realStore.updateTaskProgress(task);

    const mockTasks = await mockProvider.getTasks();
    const realTasks = await realProvider.getTasks();

    // Check both use proper indentation
    expect(mockTasks.text).toContain('\n');
    expect(realTasks.text).toContain('\n');

    // Check both start with array bracket
    expect(mockTasks.text).toMatch(/^\[\s*\{/);
    expect(realTasks.text).toMatch(/^\[\s*\{/);

    // Verify identical formatting
    expect(mockTasks.text).toEqual(realTasks.text);

    // CCR = 1.0
  });
});
