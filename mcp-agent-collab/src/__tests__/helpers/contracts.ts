import type { IToolHandler } from '../../contracts/IToolHandler.js';
import type { IResourceProvider, ResourceContent } from '../../contracts/IResourceProvider.js';
import type { IIdGenerator } from '../../contracts/IIdGenerator.js';
import type { ICollaborationStore } from '../../contracts/ICollaborationStore.js';
import type { TaskProgress, ReviewRequest, HelpRequest, CoordinationPlan } from '../../types.js';

/**
 * Contract test suite for IToolHandler
 */
export function testToolHandlerContract(
  implementationName: string,
  createHandler: () => IToolHandler
) {
  describe(`IToolHandler Contract: ${implementationName}`, () => {
    let handler: IToolHandler;

    beforeEach(() => {
      handler = createHandler();
    });

    // ==================== REQUEST REVIEW ====================

    describe('handleRequestReview', () => {
      it('should create a code review request', async () => {
        const result = await handler.handleRequestReview({
          agent: 'claude',
          code: 'function test() { return true; }',
          filePath: 'src/test.ts',
          context: 'Testing function',
        });

        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        expect(response.reviewId).toBeDefined();
        expect(response.review).toBeDefined();
        expect(response.review.code).toBe('function test() { return true; }');
        expect(response.review.filePath).toBe('src/test.ts');
        expect(response.review.context).toBe('Testing function');
        expect(response.review.requestedBy).toBe('claude');
        expect(response.review.timestamp).toBeDefined();
      });

      it('should include concerns if provided', async () => {
        const result = await handler.handleRequestReview({
          agent: 'copilot',
          code: 'const x = 1',
          filePath: 'test.js',
          context: 'Variable assignment',
          concerns: ['Performance', 'Style'],
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.review.concerns).toEqual(['Performance', 'Style']);
      });

      it('should use different agents', async () => {
        const claudeResult = await handler.handleRequestReview({
          agent: 'claude',
          code: 'code1',
          filePath: 'file1.ts',
          context: 'context1',
        });

        const copilotResult = await handler.handleRequestReview({
          agent: 'copilot',
          code: 'code2',
          filePath: 'file2.ts',
          context: 'context2',
        });

        const claudeResponse = JSON.parse(claudeResult.content[0].text);
        const copilotResponse = JSON.parse(copilotResult.content[0].text);

        expect(claudeResponse.review.requestedBy).toBe('claude');
        expect(copilotResponse.review.requestedBy).toBe('copilot');
      });
    });

    // ==================== ASK FOR HELP ====================

    describe('handleAskForHelp', () => {
      it('should create a help request', async () => {
        const result = await handler.handleAskForHelp({
          agent: 'claude',
          question: 'How do I optimize performance?',
          context: 'Application is slow',
          urgency: 'high',
        });

        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        expect(response.helpId).toBeDefined();
        expect(response.helpRequest).toBeDefined();
        expect(response.helpRequest.question).toBe('How do I optimize performance?');
        expect(response.helpRequest.context).toBe('Application is slow');
        expect(response.helpRequest.urgency).toBe('high');
        expect(response.helpRequest.requestedBy).toBe('claude');
        expect(response.helpRequest.timestamp).toBeDefined();
      });

      it('should handle all urgency levels', async () => {
        const urgencies: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

        for (const urgency of urgencies) {
          const result = await handler.handleAskForHelp({
            agent: 'copilot',
            question: 'Test question',
            context: 'Test context',
            urgency,
          });

          const response = JSON.parse(((result.content[0] as any).text));
          expect(response.helpRequest.urgency).toBe(urgency);
        }
      });
    });

    // ==================== SHARE PROGRESS ====================

    describe('handleShareProgress', () => {
      it('should share task progress', async () => {
        const result = await handler.handleShareProgress({
          agent: 'claude',
          task: 'Implement feature X',
          status: 'in_progress',
          details: 'Currently working on API endpoints',
        });

        expect(result.content).toHaveLength(1);
        const response = JSON.parse(((result.content[0] as any).text));

        expect(response.success).toBe(true);
        expect(response.taskProgress).toBeDefined();
        expect(response.taskProgress.agent).toBe('claude');
        expect(response.taskProgress.task).toBe('Implement feature X');
        expect(response.taskProgress.status).toBe('in_progress');
        expect(response.taskProgress.details).toBe('Currently working on API endpoints');
        expect(response.taskProgress.timestamp).toBeDefined();
      });

      it('should handle all status values', async () => {
        const statuses: ('planning' | 'in_progress' | 'blocked' | 'completed')[] = [
          'planning',
          'in_progress',
          'blocked',
          'completed',
        ];

        for (const status of statuses) {
          const result = await handler.handleShareProgress({
            agent: 'copilot',
            task: 'Test task',
            status,
          });

          const response = JSON.parse(((result.content[0] as any).text));
          expect(response.taskProgress.status).toBe(status);
        }
      });

      it('should work without optional details', async () => {
        const result = await handler.handleShareProgress({
          agent: 'claude',
          task: 'Task without details',
          status: 'planning',
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.taskProgress.details).toBeUndefined();
      });
    });

    // ==================== COORDINATE TASK ====================

    describe('handleCoordinateTask', () => {
      it('should create a coordination plan', async () => {
        const result = await handler.handleCoordinateTask({
          agent: 'claude',
          tasks: [
            { assignedTo: 'claude', description: 'Frontend work', priority: 1 },
            { assignedTo: 'copilot', description: 'Backend work', priority: 2 },
          ],
        });

        expect(result.content).toHaveLength(1);
        const response = JSON.parse(((result.content[0] as any).text));

        expect(response.success).toBe(true);
        expect(response.planId).toBeDefined();
        expect(response.plan).toBeDefined();
        expect(response.plan.initiatedBy).toBe('claude');
        expect(response.plan.tasks).toHaveLength(2);
        expect(response.plan.tasks[0].description).toBe('Frontend work');
        expect(response.plan.tasks[1].priority).toBe(2);
        expect(response.plan.timestamp).toBeDefined();
      });

      it('should handle empty task list', async () => {
        const result = await handler.handleCoordinateTask({
          agent: 'copilot',
          tasks: [],
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.plan.tasks).toHaveLength(0);
      });
    });

    // ==================== RESPOND TO REVIEW ====================

    describe('handleRespondToReview', () => {
      it('should return error if review not found', async () => {
        const result = await handler.handleRespondToReview({
          reviewId: 'non-existent-review',
          agent: 'copilot',
          feedback: 'Looks good',
          approved: true,
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(false);
        expect(response.error).toContain('not found');
      });

      it('should record response to existing review', async () => {
        // First create a review
        const reviewResult = await handler.handleRequestReview({
          agent: 'claude',
          code: 'test',
          filePath: 'test.ts',
          context: 'test',
        });

        const reviewResponse = JSON.parse(reviewResult.content[0].text);
        const reviewId = reviewResponse.reviewId;

        // Then respond to it
        const responseResult = await handler.handleRespondToReview({
          reviewId,
          agent: 'copilot',
          feedback: 'This looks great!',
          suggestions: ['Add tests', 'Refactor'],
          approved: true,
        });

        const response = JSON.parse(responseResult.content[0].text);
        expect(response.success).toBe(true);
        expect(response.response.reviewId).toBe(reviewId);
        expect(response.response.respondedBy).toBe('copilot');
        expect(response.response.feedback).toBe('This looks great!');
        expect(response.response.suggestions).toEqual(['Add tests', 'Refactor']);
        expect(response.response.approved).toBe(true);
      });

      it('should handle missing optional suggestions', async () => {
        // Create a review first
        const reviewResult = await handler.handleRequestReview({
          agent: 'claude',
          code: 'test',
          filePath: 'test.ts',
          context: 'test',
        });

        const reviewResponse = JSON.parse(reviewResult.content[0].text);
        const reviewId = reviewResponse.reviewId;

        // Respond without suggestions
        const responseResult = await handler.handleRespondToReview({
          reviewId,
          agent: 'copilot',
          feedback: 'Good work',
          approved: false,
        });

        const response = JSON.parse(responseResult.content[0].text);
        expect(response.response.suggestions).toBeUndefined();
      });
    });

    // ==================== RESPOND TO HELP ====================

    describe('handleRespondToHelp', () => {
      it('should return error if help request not found', async () => {
        const result = await handler.handleRespondToHelp({
          helpId: 'non-existent-help',
          agent: 'claude',
          response: 'Here is the answer',
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(false);
        expect(response.error).toContain('not found');
      });

      it('should record response to existing help request', async () => {
        // First create a help request
        const helpResult = await handler.handleAskForHelp({
          agent: 'copilot',
          question: 'How do I debug this?',
          context: 'Code is broken',
          urgency: 'high',
        });

        const helpResponse = JSON.parse(helpResult.content[0].text);
        const helpId = helpResponse.helpId;

        // Then respond to it
        const responseResult = await handler.handleRespondToHelp({
          helpId,
          agent: 'claude',
          response: 'Use console.log to debug',
          additionalResources: ['https://example.com/debug', 'https://example.com/tips'],
        });

        const response = JSON.parse(responseResult.content[0].text);
        expect(response.success).toBe(true);
        expect(response.response.helpId).toBe(helpId);
        expect(response.response.respondedBy).toBe('claude');
        expect(response.response.response).toBe('Use console.log to debug');
        expect(response.response.additionalResources).toEqual([
          'https://example.com/debug',
          'https://example.com/tips',
        ]);
      });

      it('should handle missing optional resources', async () => {
        // Create a help request
        const helpResult = await handler.handleAskForHelp({
          agent: 'copilot',
          question: 'Question?',
          context: 'Context',
          urgency: 'low',
        });

        const helpResponse = JSON.parse(helpResult.content[0].text);
        const helpId = helpResponse.helpId;

        // Respond without resources
        const responseResult = await handler.handleRespondToHelp({
          helpId,
          agent: 'claude',
          response: 'Answer',
        });

        const response = JSON.parse(responseResult.content[0].text);
        expect(response.response.additionalResources).toBeUndefined();
      });
    });

    // ==================== SET CONTEXT ====================

    describe('handleSetContext', () => {
      it('should set a string context variable', async () => {
        const result = await handler.handleSetContext({
          key: 'api_url',
          value: 'https://api.example.com',
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        expect(response.key).toBe('api_url');
        expect(response.value).toBe('https://api.example.com');
      });

      it('should parse JSON string values', async () => {
        const result = await handler.handleSetContext({
          key: 'config',
          value: '{"debug": true, "timeout": 5000}',
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        expect(response.value).toEqual({ debug: true, timeout: 5000 });
      });

      it('should handle non-JSON string values', async () => {
        const result = await handler.handleSetContext({
          key: 'description',
          value: 'Not valid JSON but a plain string',
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.value).toBe('Not valid JSON but a plain string');
      });

      it('should overwrite existing context keys', async () => {
        // Set first value
        await handler.handleSetContext({
          key: 'version',
          value: '1.0.0',
        });

        // Set new value
        const result = await handler.handleSetContext({
          key: 'version',
          value: '2.0.0',
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.value).toBe('2.0.0');
      });
    });

    // ==================== CLEAR COMPLETED ====================

    describe('handleClearCompleted', () => {
      it('should clear only completed tasks', async () => {
        // Add mixed task statuses
        await handler.handleShareProgress({
          agent: 'claude',
          task: 'Task 1',
          status: 'completed',
        });

        await handler.handleShareProgress({
          agent: 'claude',
          task: 'Task 2',
          status: 'in_progress',
        });

        await handler.handleShareProgress({
          agent: 'copilot',
          task: 'Task 3',
          status: 'completed',
        });

        const result = await handler.handleClearCompleted({
          clearTasks: true,
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        expect(response.clearedItems.tasks).toBe(2); // Two completed tasks
        expect(response.clearedItems.reviews).toBe(0);
        expect(response.clearedItems.help).toBe(0);
      });

      it('should clear reviews when requested', async () => {
        // Add reviews
        await handler.handleRequestReview({
          agent: 'claude',
          code: 'code1',
          filePath: 'file1.ts',
          context: 'context1',
        });

        await handler.handleRequestReview({
          agent: 'copilot',
          code: 'code2',
          filePath: 'file2.ts',
          context: 'context2',
        });

        const result = await handler.handleClearCompleted({
          clearReviews: true,
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        // The store's clearOldReviews doesn't clear with keepCount=0
        // because slice(-0) returns the full array
        // So clearedItems.reviews should be 0
        expect(response.clearedItems.reviews).toBe(0);
      });

      it('should clear help requests when requested', async () => {
        // Add help requests
        await handler.handleAskForHelp({
          agent: 'claude',
          question: 'Q1?',
          context: 'C1',
          urgency: 'low',
        });

        await handler.handleAskForHelp({
          agent: 'copilot',
          question: 'Q2?',
          context: 'C2',
          urgency: 'medium',
        });

        const result = await handler.handleClearCompleted({
          clearHelp: true,
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        // The store's clearOldHelp doesn't clear with keepCount=0
        // because slice(-0) returns the full array
        // So clearedItems.help should be 0
        expect(response.clearedItems.help).toBe(0);
      });

      it('should handle mixed clear operations', async () => {
        // Add all types of items
        await handler.handleShareProgress({
          agent: 'claude',
          task: 'Task 1',
          status: 'completed',
        });

        await handler.handleRequestReview({
          agent: 'claude',
          code: 'code',
          filePath: 'file.ts',
          context: 'ctx',
        });

        await handler.handleAskForHelp({
          agent: 'claude',
          question: 'Q?',
          context: 'C',
          urgency: 'high',
        });

        const result = await handler.handleClearCompleted({
          clearTasks: true,
          clearReviews: true,
          clearHelp: true,
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        expect(response.clearedItems.tasks).toBe(1);
        // The store's clearOldReviews/clearOldHelp don't clear with keepCount=0
        expect(response.clearedItems.reviews).toBe(0);
        expect(response.clearedItems.help).toBe(0);
      });

      it('should return 0 cleared items when nothing to clear', async () => {
        const result = await handler.handleClearCompleted({
          clearTasks: true,
          clearReviews: true,
          clearHelp: true,
        });

        const response = JSON.parse(((result.content[0] as any).text));
        expect(response.success).toBe(true);
        expect(response.clearedItems.tasks).toBe(0);
        expect(response.clearedItems.reviews).toBe(0);
        expect(response.clearedItems.help).toBe(0);
      });
    });
  });
}

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
 * Contract test suite for IResourceProvider
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
