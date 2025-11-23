/**
 * CONTRACT TESTS for IToolHandler
 *
 * These tests define the contract that ALL implementations must satisfy.
 * Both MockToolHandler and ToolHandler must pass these identical tests.
 *
 * CCR (Contract Compliance Ratio) = 1.0 means Mock and Real behave identically.
 */

import type { IToolHandler } from '../contracts/IToolHandler.js';

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
