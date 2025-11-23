/**
 * IMPLEMENTATION TESTS for ToolHandler
 *
 * This file runs the contract tests against both Mock and Real implementations.
 * It verifies that CCR (Contract Compliance Ratio) = 1.0
 *
 * Both implementations must behave identically according to the contract.
 */

import { testToolHandlerContract } from './ToolHandler.spec.js';
import { MockToolHandler } from '../mocks/MockToolHandler.js';
import { ToolHandler } from '../services/ToolHandler.js';
import { MockCollaborationStore } from '../mocks/MockCollaborationStore.js';
import { InMemoryCollaborationStore } from '../services/InMemoryCollaborationStore.js';
import { MockIdGenerator } from '../mocks/MockIdGenerator.js';

/**
 * Run contract tests against MockToolHandler
 * This ensures the mock implementation follows the contract
 */
testToolHandlerContract(
  'MockToolHandler',
  () => new MockToolHandler(new MockCollaborationStore(), new MockIdGenerator())
);

/**
 * Run contract tests against real ToolHandler
 * This ensures the real implementation follows the same contract
 */
testToolHandlerContract(
  'ToolHandler (Real)',
  () => new ToolHandler(new InMemoryCollaborationStore(), new MockIdGenerator())
);

/**
 * CCR Verification Test
 * Confirms that both implementations produce the same outputs for the same inputs
 */
describe('CCR (Contract Compliance Ratio) Verification', () => {
  it('should have CCR = 1.0: Both mock and real implementations behave identically', async () => {
    const mockHandler = new MockToolHandler(new MockCollaborationStore(), new MockIdGenerator());
    const realHandler = new ToolHandler(new InMemoryCollaborationStore(), new MockIdGenerator());

    // Test 1: handleRequestReview produces identical results
    const mockReviewResult = await mockHandler.handleRequestReview({
      agent: 'claude',
      code: 'function test() {}',
      filePath: 'test.ts',
      context: 'testing',
      concerns: ['style'],
    });

    const realReviewResult = await realHandler.handleRequestReview({
      agent: 'claude',
      code: 'function test() {}',
      filePath: 'test.ts',
      context: 'testing',
      concerns: ['style'],
    });

    // Both should have success: true (content and structure should match)
    const mockReviewResponse = JSON.parse(mockReviewResult.content[0].text);
    const realReviewResponse = JSON.parse(realReviewResult.content[0].text);

    expect(mockReviewResponse.success).toBe(realReviewResponse.success);
    expect(mockReviewResponse.review.code).toBe(realReviewResponse.review.code);
    expect(mockReviewResponse.review.filePath).toBe(realReviewResponse.review.filePath);
    expect(mockReviewResponse.review.context).toBe(realReviewResponse.review.context);
    expect(mockReviewResponse.review.requestedBy).toBe(realReviewResponse.review.requestedBy);

    // Test 2: handleAskForHelp produces identical results
    const mockHelpResult = await mockHandler.handleAskForHelp({
      agent: 'copilot',
      question: 'How to optimize?',
      context: 'slow app',
      urgency: 'high',
    });

    const realHelpResult = await realHandler.handleAskForHelp({
      agent: 'copilot',
      question: 'How to optimize?',
      context: 'slow app',
      urgency: 'high',
    });

    const mockHelpResponse = JSON.parse(mockHelpResult.content[0].text);
    const realHelpResponse = JSON.parse(realHelpResult.content[0].text);

    expect(mockHelpResponse.success).toBe(realHelpResponse.success);
    expect(mockHelpResponse.helpRequest.question).toBe(realHelpResponse.helpRequest.question);
    expect(mockHelpResponse.helpRequest.urgency).toBe(realHelpResponse.helpRequest.urgency);

    // Test 3: handleShareProgress produces identical results
    const mockProgressResult = await mockHandler.handleShareProgress({
      agent: 'claude',
      task: 'Implement feature',
      status: 'in_progress',
      details: 'Working on API',
    });

    const realProgressResult = await realHandler.handleShareProgress({
      agent: 'claude',
      task: 'Implement feature',
      status: 'in_progress',
      details: 'Working on API',
    });

    const mockProgressResponse = JSON.parse(mockProgressResult.content[0].text);
    const realProgressResponse = JSON.parse(realProgressResult.content[0].text);

    expect(mockProgressResponse.success).toBe(realProgressResponse.success);
    expect(mockProgressResponse.taskProgress.status).toBe(realProgressResponse.taskProgress.status);

    // Test 4: handleCoordinateTask produces identical results
    const mockCoordResult = await mockHandler.handleCoordinateTask({
      agent: 'claude',
      tasks: [
        { assignedTo: 'claude', description: 'Frontend', priority: 1 },
        { assignedTo: 'copilot', description: 'Backend', priority: 2 },
      ],
    });

    const realCoordResult = await realHandler.handleCoordinateTask({
      agent: 'claude',
      tasks: [
        { assignedTo: 'claude', description: 'Frontend', priority: 1 },
        { assignedTo: 'copilot', description: 'Backend', priority: 2 },
      ],
    });

    const mockCoordResponse = JSON.parse(mockCoordResult.content[0].text);
    const realCoordResponse = JSON.parse(realCoordResult.content[0].text);

    expect(mockCoordResponse.success).toBe(realCoordResponse.success);
    expect(mockCoordResponse.plan.tasks).toEqual(realCoordResponse.plan.tasks);

    // Test 5: handleSetContext produces identical results
    const mockContextResult = await mockHandler.handleSetContext({
      key: 'api_url',
      value: 'https://api.example.com',
    });

    const realContextResult = await realHandler.handleSetContext({
      key: 'api_url',
      value: 'https://api.example.com',
    });

    const mockContextResponse = JSON.parse(mockContextResult.content[0].text);
    const realContextResponse = JSON.parse(realContextResult.content[0].text);

    expect(mockContextResponse.success).toBe(realContextResponse.success);
    expect(mockContextResponse.value).toBe(realContextResponse.value);

    // Test 6: handleClearCompleted produces identical results
    const mockClearResult = await mockHandler.handleClearCompleted({
      clearTasks: true,
      clearReviews: true,
      clearHelp: true,
    });

    const realClearResult = await realHandler.handleClearCompleted({
      clearTasks: true,
      clearReviews: true,
      clearHelp: true,
    });

    const mockClearResponse = JSON.parse(mockClearResult.content[0].text);
    const realClearResponse = JSON.parse(realClearResult.content[0].text);

    expect(mockClearResponse.success).toBe(realClearResponse.success);
    expect(mockClearResponse.clearedItems).toEqual(realClearResponse.clearedItems);

    // Test 7: Error handling - both should handle missing review ID the same way
    const mockErrorResult = await mockHandler.handleRespondToReview({
      reviewId: 'non-existent',
      agent: 'claude',
      feedback: 'test',
      approved: false,
    });

    const realErrorResult = await realHandler.handleRespondToReview({
      reviewId: 'non-existent',
      agent: 'claude',
      feedback: 'test',
      approved: false,
    });

    const mockErrorResponse = JSON.parse(mockErrorResult.content[0].text);
    const realErrorResponse = JSON.parse(realErrorResult.content[0].text);

    expect(mockErrorResponse.success).toBe(realErrorResponse.success);
    expect(mockErrorResponse.success).toBe(false);
    expect(mockErrorResponse.error).toContain('not found');
    expect(realErrorResponse.error).toContain('not found');
  });
});
