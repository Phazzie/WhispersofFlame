/**
 * CONTRACT TESTS for IResourceProvider
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockResourceProvider and ResourceProvider must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { IResourceProvider, ResourceContent } from '../contracts/IResourceProvider.js';
import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';
import type { TaskProgress, ReviewRequest, HelpRequest, CoordinationPlan } from '../types.js';

// Prevent "Your test suite must contain at least one test" error
describe('Contract Tests Export', () => {
  it('should export testResourceProviderContract function', () => {
    expect(typeof testResourceProviderContract).toBe('function');
  });
});

/**
 * Test helper: Create a sample task
 */
function createTask(
  agent: 'claude' | 'copilot' = 'claude',
  task: string = 'Test Task',
  status: TaskProgress['status'] = 'in_progress'
): TaskProgress {
  return {
    agent,
    task,
    status,
    details: `Details for ${task}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test helper: Create a sample review
 */
function createReview(id: string, requestedBy: 'claude' | 'copilot' = 'claude'): ReviewRequest {
  return {
    id,
    requestedBy,
    code: 'function test() { return true; }',
    filePath: `src/${id}.ts`,
    context: `Review context for ${id}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test helper: Create a sample help request
 */
function createHelp(id: string, requestedBy: 'claude' | 'copilot' = 'copilot'): HelpRequest {
  return {
    id,
    requestedBy,
    question: `How to ${id}?`,
    context: `Help context for ${id}`,
    urgency: 'medium',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test helper: Create a sample coordination plan
 */
function createPlan(id: string, initiatedBy: 'claude' | 'copilot' = 'claude'): CoordinationPlan {
  return {
    id,
    initiatedBy,
    tasks: [
      { assignedTo: 'claude', description: 'Frontend task', priority: 1 },
      { assignedTo: 'copilot', description: 'Backend task', priority: 2 },
    ],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test helper: Verify resource content structure
 */
function verifyResourceContent(content: ResourceContent, expectedUri: string): void {
  expect(content).toBeDefined();
  expect(content.uri).toBe(expectedUri);
  expect(content.mimeType).toBe('application/json');
  expect(typeof content.text).toBe('string');
  // Verify it's valid JSON
  expect(() => JSON.parse(content.text)).not.toThrow();
}

/**
 * Contract test suite
 * This function accepts a factory that creates an IResourceProvider implementation
 * It runs the full contract test suite against that implementation
 */
export function testResourceProviderContract(
  implementationName: string,
  createProvider: (store: ICollaborationStore) => IResourceProvider,
  createStore: () => ICollaborationStore
) {
  describe(`IResourceProvider Contract: ${implementationName}`, () => {
    let provider: IResourceProvider;
    let store: ICollaborationStore;

    beforeEach(() => {
      store = createStore();
      provider = createProvider(store);
    });

    // ==================== TASKS RESOURCE ====================

    describe('getTasks()', () => {
      it('should return ResourceContent with correct structure', async () => {
        const content = await provider.getTasks();
        verifyResourceContent(content, 'collab://state/tasks');
      });

      it('should return empty array when no tasks exist', async () => {
        const content = await provider.getTasks();
        const parsed = JSON.parse(content.text);
        expect(parsed).toEqual([]);
      });

      it('should return tasks from store', async () => {
        const task1 = createTask('claude', 'Task 1');
        const task2 = createTask('copilot', 'Task 2');

        await store.updateTaskProgress(task1);
        await store.updateTaskProgress(task2);

        const content = await provider.getTasks();
        const parsed = JSON.parse(content.text);

        expect(parsed).toHaveLength(2);
        expect(parsed).toContainEqual(task1);
        expect(parsed).toContainEqual(task2);
      });

      it('should format JSON with proper indentation', async () => {
        const task = createTask('claude', 'Test Task');
        await store.updateTaskProgress(task);

        const content = await provider.getTasks();
        // Check for indentation (should have spaces, not be minified)
        expect(content.text).toContain('\n');
        expect(content.text).toMatch(/^\[\s*\{/);
      });
    });

    // ==================== REVIEWS RESOURCE ====================

    describe('getReviews()', () => {
      it('should return ResourceContent with correct structure', async () => {
        const content = await provider.getReviews();
        verifyResourceContent(content, 'collab://state/reviews');
      });

      it('should return empty array when no reviews exist', async () => {
        const content = await provider.getReviews();
        const parsed = JSON.parse(content.text);
        expect(parsed).toEqual([]);
      });

      it('should return reviews from store', async () => {
        const review1 = createReview('review-1', 'claude');
        const review2 = createReview('review-2', 'copilot');

        await store.addReviewRequest(review1);
        await store.addReviewRequest(review2);

        const content = await provider.getReviews();
        const parsed = JSON.parse(content.text);

        expect(parsed).toHaveLength(2);
        expect(parsed).toContainEqual(review1);
        expect(parsed).toContainEqual(review2);
      });

      it('should format JSON with proper indentation', async () => {
        const review = createReview('review-1');
        await store.addReviewRequest(review);

        const content = await provider.getReviews();
        expect(content.text).toContain('\n');
        expect(content.text).toMatch(/^\[\s*\{/);
      });
    });

    // ==================== HELP RESOURCE ====================

    describe('getHelp()', () => {
      it('should return ResourceContent with correct structure', async () => {
        const content = await provider.getHelp();
        verifyResourceContent(content, 'collab://state/help');
      });

      it('should return empty array when no help requests exist', async () => {
        const content = await provider.getHelp();
        const parsed = JSON.parse(content.text);
        expect(parsed).toEqual([]);
      });

      it('should return help requests from store', async () => {
        const help1 = createHelp('help-1', 'claude');
        const help2 = createHelp('help-2', 'copilot');

        await store.addHelpRequest(help1);
        await store.addHelpRequest(help2);

        const content = await provider.getHelp();
        const parsed = JSON.parse(content.text);

        expect(parsed).toHaveLength(2);
        expect(parsed).toContainEqual(help1);
        expect(parsed).toContainEqual(help2);
      });

      it('should format JSON with proper indentation', async () => {
        const help = createHelp('help-1');
        await store.addHelpRequest(help);

        const content = await provider.getHelp();
        expect(content.text).toContain('\n');
        expect(content.text).toMatch(/^\[\s*\{/);
      });
    });

    // ==================== COORDINATION RESOURCE ====================

    describe('getCoordination()', () => {
      it('should return ResourceContent with correct structure', async () => {
        const content = await provider.getCoordination();
        verifyResourceContent(content, 'collab://state/coordination');
      });

      it('should return empty array when no coordination plans exist', async () => {
        const content = await provider.getCoordination();
        const parsed = JSON.parse(content.text);
        expect(parsed).toEqual([]);
      });

      it('should return coordination plans from store', async () => {
        const plan1 = createPlan('plan-1', 'claude');
        const plan2 = createPlan('plan-2', 'copilot');

        await store.addCoordinationPlan(plan1);
        await store.addCoordinationPlan(plan2);

        const content = await provider.getCoordination();
        const parsed = JSON.parse(content.text);

        expect(parsed).toHaveLength(2);
        expect(parsed).toContainEqual(plan1);
        expect(parsed).toContainEqual(plan2);
      });

      it('should format JSON with proper indentation', async () => {
        const plan = createPlan('plan-1');
        await store.addCoordinationPlan(plan);

        const content = await provider.getCoordination();
        expect(content.text).toContain('\n');
        expect(content.text).toMatch(/^\[\s*\{/);
      });
    });

    // ==================== CONTEXT RESOURCE ====================

    describe('getContext()', () => {
      it('should return ResourceContent with correct structure', async () => {
        const content = await provider.getContext();
        verifyResourceContent(content, 'collab://state/context');
      });

      it('should return empty object when no context exists', async () => {
        const content = await provider.getContext();
        const parsed = JSON.parse(content.text);
        expect(parsed).toEqual({});
      });

      it('should return context from store', async () => {
        await store.setContext('key1', 'value1');
        await store.setContext('key2', { nested: 'object' });

        const content = await provider.getContext();
        const parsed = JSON.parse(content.text);

        expect(parsed).toEqual({
          key1: 'value1',
          key2: { nested: 'object' },
        });
      });

      it('should format JSON with proper indentation', async () => {
        await store.setContext('key', 'value');

        const content = await provider.getContext();
        expect(content.text).toContain('\n');
        expect(content.text).toMatch(/^\{\s*"/);
      });
    });

    // ==================== getResource() ROUTING ====================

    describe('getResource(uri)', () => {
      it('should route collab://state/tasks to getTasks()', async () => {
        const task = createTask();
        await store.updateTaskProgress(task);

        const content = await provider.getResource('collab://state/tasks');
        const parsed = JSON.parse(content.text);

        expect(content.uri).toBe('collab://state/tasks');
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toEqual(task);
      });

      it('should route collab://state/reviews to getReviews()', async () => {
        const review = createReview('review-1');
        await store.addReviewRequest(review);

        const content = await provider.getResource('collab://state/reviews');
        const parsed = JSON.parse(content.text);

        expect(content.uri).toBe('collab://state/reviews');
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toEqual(review);
      });

      it('should route collab://state/help to getHelp()', async () => {
        const help = createHelp('help-1');
        await store.addHelpRequest(help);

        const content = await provider.getResource('collab://state/help');
        const parsed = JSON.parse(content.text);

        expect(content.uri).toBe('collab://state/help');
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toEqual(help);
      });

      it('should route collab://state/coordination to getCoordination()', async () => {
        const plan = createPlan('plan-1');
        await store.addCoordinationPlan(plan);

        const content = await provider.getResource('collab://state/coordination');
        const parsed = JSON.parse(content.text);

        expect(content.uri).toBe('collab://state/coordination');
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toEqual(plan);
      });

      it('should route collab://state/context to getContext()', async () => {
        await store.setContext('key', 'value');

        const content = await provider.getResource('collab://state/context');
        const parsed = JSON.parse(content.text);

        expect(content.uri).toBe('collab://state/context');
        expect(parsed).toEqual({ key: 'value' });
      });

      it('should throw error for unknown URI', async () => {
        await expect(provider.getResource('collab://state/unknown')).rejects.toThrow(
          'Unknown resource URI: collab://state/unknown'
        );
      });

      it('should throw error for invalid URI format', async () => {
        await expect(provider.getResource('invalid://uri')).rejects.toThrow('Unknown resource URI');
      });

      it('should throw error for empty URI', async () => {
        await expect(provider.getResource('')).rejects.toThrow('Unknown resource URI');
      });
    });

    // ==================== FORMAT CONSISTENCY ====================

    describe('Format Consistency', () => {
      it('all resources should have application/json mimeType', async () => {
        const resources = [
          await provider.getTasks(),
          await provider.getReviews(),
          await provider.getHelp(),
          await provider.getCoordination(),
          await provider.getContext(),
        ];

        resources.forEach(resource => {
          expect(resource.mimeType).toBe('application/json');
        });
      });

      it('all resources should have valid JSON text', async () => {
        const resources = [
          await provider.getTasks(),
          await provider.getReviews(),
          await provider.getHelp(),
          await provider.getCoordination(),
          await provider.getContext(),
        ];

        resources.forEach(resource => {
          expect(() => JSON.parse(resource.text)).not.toThrow();
        });
      });

      it('all resources should have matching URI in content and uri field', async () => {
        const resources = [
          { method: () => provider.getTasks(), expectedUri: 'collab://state/tasks' },
          { method: () => provider.getReviews(), expectedUri: 'collab://state/reviews' },
          { method: () => provider.getHelp(), expectedUri: 'collab://state/help' },
          { method: () => provider.getCoordination(), expectedUri: 'collab://state/coordination' },
          { method: () => provider.getContext(), expectedUri: 'collab://state/context' },
        ];

        for (const resource of resources) {
          const content = await resource.method();
          expect(content.uri).toBe(resource.expectedUri);
        }
      });
    });
  });
}
