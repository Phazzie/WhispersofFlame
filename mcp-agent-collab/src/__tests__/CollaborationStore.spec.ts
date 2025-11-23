/**
 * CONTRACT TESTS for ICollaborationStore
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockCollaborationStore and InMemoryCollaborationStore must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';

// Prevent "Your test suite must contain at least one test" error
describe('Contract Tests Export', () => {
  it('should export testCollaborationStoreContract function', () => {
    expect(typeof testCollaborationStoreContract).toBe('function');
  });
});
import type { ReviewRequest, HelpRequest, TaskProgress, CoordinationPlan } from '../types.js';

/**
 * Test helper: Create a sample review request
 */
function createReview(id: string, agent: 'claude' | 'copilot' = 'claude'): ReviewRequest {
  return {
    id,
    requestedBy: agent,
    code: `function example() { return "${id}"; }`,
    filePath: `src/${id}.ts`,
    context: `Test review ${id}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test helper: Create a sample help request
 */
function createHelp(id: string, agent: 'claude' | 'copilot' = 'copilot'): HelpRequest {
  return {
    id,
    requestedBy: agent,
    question: `How do I ${id}?`,
    context: `Context for ${id}`,
    urgency: 'medium',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test helper: Create a sample task progress
 */
function createTask(agent: 'claude' | 'copilot', task: string, status: TaskProgress['status'] = 'in_progress'): TaskProgress {
  return {
    agent,
    task,
    status,
    details: `Working on ${task}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Test helper: Create a sample coordination plan
 */
function createPlan(id: string, agent: 'claude' | 'copilot' = 'claude'): CoordinationPlan {
  return {
    id,
    initiatedBy: agent,
    tasks: [
      { assignedTo: 'claude', description: 'Frontend work', priority: 1 },
      { assignedTo: 'copilot', description: 'Backend work', priority: 2 },
    ],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Contract test suite
 * This function accepts a factory that creates an ICollaborationStore implementation
 * It runs the full contract test suite against that implementation
 */
export function testCollaborationStoreContract(
  implementationName: string,
  createStore: () => ICollaborationStore
) {
  describe(`ICollaborationStore Contract: ${implementationName}`, () => {
    let store: ICollaborationStore;

    beforeEach(() => {
      store = createStore();
    });

    // ==================== REVIEW OPERATIONS ====================

    describe('Review Operations', () => {
      it('should add and retrieve a review request', async () => {
        const review = createReview('review-1');
        const id = await store.addReviewRequest(review);

        expect(id).toBe('review-1');

        const retrieved = await store.getReviewRequest(id);
        expect(retrieved).toEqual(review);
      });

      it('should return null for non-existent review', async () => {
        const result = await store.getReviewRequest('non-existent');
        expect(result).toBeNull();
      });

      it('should store multiple reviews', async () => {
        const review1 = createReview('review-1');
        const review2 = createReview('review-2', 'copilot');

        await store.addReviewRequest(review1);
        await store.addReviewRequest(review2);

        const all = await store.getAllReviews();
        expect(all).toHaveLength(2);
        expect(all).toContainEqual(review1);
        expect(all).toContainEqual(review2);
      });

      it('should clear old reviews keeping only recent N', async () => {
        // Add 10 reviews
        for (let i = 0; i < 10; i++) {
          await store.addReviewRequest(createReview(`review-${i}`));
        }

        // Clear, keeping only 3
        await store.clearOldReviews(3);

        const remaining = await store.getAllReviews();
        expect(remaining).toHaveLength(3);

        // Should keep the most recent ones (7, 8, 9)
        const ids = remaining.map(r => r.id);
        expect(ids).toContain('review-7');
        expect(ids).toContain('review-8');
        expect(ids).toContain('review-9');
      });
    });

    // ==================== HELP OPERATIONS ====================

    describe('Help Operations', () => {
      it('should add and retrieve a help request', async () => {
        const help = createHelp('help-1');
        const id = await store.addHelpRequest(help);

        expect(id).toBe('help-1');

        const retrieved = await store.getHelpRequest(id);
        expect(retrieved).toEqual(help);
      });

      it('should return null for non-existent help request', async () => {
        const result = await store.getHelpRequest('non-existent');
        expect(result).toBeNull();
      });

      it('should store multiple help requests', async () => {
        const help1 = createHelp('help-1');
        const help2 = createHelp('help-2', 'claude');

        await store.addHelpRequest(help1);
        await store.addHelpRequest(help2);

        const all = await store.getAllHelp();
        expect(all).toHaveLength(2);
        expect(all).toContainEqual(help1);
        expect(all).toContainEqual(help2);
      });

      it('should clear old help requests keeping only recent N', async () => {
        // Add 8 help requests
        for (let i = 0; i < 8; i++) {
          await store.addHelpRequest(createHelp(`help-${i}`));
        }

        // Clear, keeping only 2
        await store.clearOldHelp(2);

        const remaining = await store.getAllHelp();
        expect(remaining).toHaveLength(2);

        // Should keep the most recent ones (6, 7)
        const ids = remaining.map(h => h.id);
        expect(ids).toContain('help-6');
        expect(ids).toContain('help-7');
      });
    });

    // ==================== TASK OPERATIONS ====================

    describe('Task Operations', () => {
      it('should add a task progress entry', async () => {
        const task = createTask('claude', 'Implement feature X');

        await store.updateTaskProgress(task);

        const all = await store.getAllTasks();
        expect(all).toHaveLength(1);
        expect(all[0]).toEqual(task);
      });

      it('should update existing task for same agent and task name', async () => {
        const task1 = createTask('claude', 'Build UI', 'in_progress');
        const task2 = createTask('claude', 'Build UI', 'completed');

        await store.updateTaskProgress(task1);
        await store.updateTaskProgress(task2);

        const all = await store.getAllTasks();
        expect(all).toHaveLength(1);
        expect(all[0].status).toBe('completed');
      });

      it('should store separate tasks for different agents', async () => {
        const task1 = createTask('claude', 'Build UI');
        const task2 = createTask('copilot', 'Build UI');

        await store.updateTaskProgress(task1);
        await store.updateTaskProgress(task2);

        const all = await store.getAllTasks();
        expect(all).toHaveLength(2);
      });

      it('should store separate tasks for same agent, different task names', async () => {
        const task1 = createTask('claude', 'Task A');
        const task2 = createTask('claude', 'Task B');

        await store.updateTaskProgress(task1);
        await store.updateTaskProgress(task2);

        const all = await store.getAllTasks();
        expect(all).toHaveLength(2);
      });

      it('should clear only completed tasks', async () => {
        await store.updateTaskProgress(createTask('claude', 'Task 1', 'completed'));
        await store.updateTaskProgress(createTask('claude', 'Task 2', 'in_progress'));
        await store.updateTaskProgress(createTask('copilot', 'Task 3', 'completed'));
        await store.updateTaskProgress(createTask('copilot', 'Task 4', 'blocked'));

        await store.clearCompletedTasks();

        const remaining = await store.getAllTasks();
        expect(remaining).toHaveLength(2);

        const statuses = remaining.map(t => t.status);
        expect(statuses).toContain('in_progress');
        expect(statuses).toContain('blocked');
        expect(statuses).not.toContain('completed');
      });
    });

    // ==================== COORDINATION OPERATIONS ====================

    describe('Coordination Operations', () => {
      it('should add and retrieve coordination plans', async () => {
        const plan = createPlan('plan-1');

        const id = await store.addCoordinationPlan(plan);
        expect(id).toBe('plan-1');

        const all = await store.getAllPlans();
        expect(all).toHaveLength(1);
        expect(all[0]).toEqual(plan);
      });

      it('should store multiple coordination plans', async () => {
        const plan1 = createPlan('plan-1', 'claude');
        const plan2 = createPlan('plan-2', 'copilot');

        await store.addCoordinationPlan(plan1);
        await store.addCoordinationPlan(plan2);

        const all = await store.getAllPlans();
        expect(all).toHaveLength(2);
        expect(all).toContainEqual(plan1);
        expect(all).toContainEqual(plan2);
      });
    });

    // ==================== CONTEXT OPERATIONS ====================

    describe('Context Operations', () => {
      it('should set and get a context variable', async () => {
        await store.setContext('api_url', 'https://api.example.com');

        const value = await store.getContext('api_url');
        expect(value).toBe('https://api.example.com');
      });

      it('should return undefined for non-existent context key', async () => {
        const value = await store.getContext('non-existent');
        expect(value).toBeUndefined();
      });

      it('should store multiple context variables', async () => {
        await store.setContext('key1', 'value1');
        await store.setContext('key2', { nested: 'object' });
        await store.setContext('key3', 123);

        const all = await store.getAllContext();
        expect(all).toEqual({
          key1: 'value1',
          key2: { nested: 'object' },
          key3: 123,
        });
      });

      it('should overwrite existing context key', async () => {
        await store.setContext('key', 'old-value');
        await store.setContext('key', 'new-value');

        const value = await store.getContext('key');
        expect(value).toBe('new-value');
      });

      it('should handle various data types in context', async () => {
        const testCases = [
          { key: 'string', value: 'hello' },
          { key: 'number', value: 42 },
          { key: 'boolean', value: true },
          { key: 'null', value: null },
          { key: 'array', value: [1, 2, 3] },
          { key: 'object', value: { a: 1, b: 2 } },
        ];

        for (const testCase of testCases) {
          await store.setContext(testCase.key, testCase.value);
        }

        for (const testCase of testCases) {
          const value = await store.getContext(testCase.key);
          expect(value).toEqual(testCase.value);
        }
      });
    });
  });
}
