/**
 * MOCK IMPLEMENTATION: ToolHandler
 *
 * Purpose: Fast, predictable tool handling for testing
 * Use cases:
 *   - Unit tests that need a handler dependency
 *   - Fast CI/CD pipeline tests
 *   - Development without real MCP infrastructure
 *
 * Behavior:
 *   - Uses MockCollaborationStore and MockIdGenerator as dependencies
 *   - Returns predictable responses
 *   - Straightforward business logic
 *   - No external dependencies beyond ICollaborationStore and IIdGenerator
 *   - Must pass identical contract tests as real implementation (CCR = 1.0)
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { IToolHandler, RequestReviewArgs, AskForHelpArgs, ShareProgressArgs, CoordinateTaskArgs, RespondToReviewArgs, RespondToHelpArgs, SetContextArgs, ClearCompletedArgs } from '../contracts/IToolHandler.js';
import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';
import type { IIdGenerator } from '../contracts/IIdGenerator.js';
import type { ReviewRequest, HelpRequest, TaskProgress, CoordinationPlan } from '../types.js';

export class MockToolHandler implements IToolHandler {
  constructor(
    private store: ICollaborationStore,
    private idGenerator: IIdGenerator
  ) {}

  async handleRequestReview(args: RequestReviewArgs): Promise<CallToolResult> {
    const reviewId = this.idGenerator.generate();
    const review: ReviewRequest = {
      id: reviewId,
      requestedBy: args.agent,
      code: args.code,
      filePath: args.filePath,
      context: args.context,
      concerns: args.concerns,
      timestamp: new Date().toISOString(),
    };

    await this.store.addReviewRequest(review);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            reviewId,
            message: `Code review request created with ID: ${reviewId}`,
            review,
          }),
        },
      ],
    };
  }

  async handleAskForHelp(args: AskForHelpArgs): Promise<CallToolResult> {
    const helpId = this.idGenerator.generate();
    const helpRequest: HelpRequest = {
      id: helpId,
      requestedBy: args.agent,
      question: args.question,
      context: args.context,
      urgency: args.urgency,
      timestamp: new Date().toISOString(),
    };

    await this.store.addHelpRequest(helpRequest);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            helpId,
            message: `Help request created with ID: ${helpId}`,
            helpRequest,
          }),
        },
      ],
    };
  }

  async handleShareProgress(args: ShareProgressArgs): Promise<CallToolResult> {
    const taskProgress: TaskProgress = {
      agent: args.agent,
      task: args.task,
      status: args.status,
      details: args.details,
      timestamp: new Date().toISOString(),
    };

    await this.store.updateTaskProgress(taskProgress);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Progress shared for ${args.agent}: ${args.task} is now ${args.status}`,
            taskProgress,
          }),
        },
      ],
    };
  }

  async handleCoordinateTask(args: CoordinateTaskArgs): Promise<CallToolResult> {
    const planId = this.idGenerator.generate();
    const plan: CoordinationPlan = {
      id: planId,
      initiatedBy: args.agent,
      tasks: args.tasks,
      timestamp: new Date().toISOString(),
    };

    await this.store.addCoordinationPlan(plan);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            planId,
            message: `Coordination plan created with ID: ${planId}`,
            plan,
          }),
        },
      ],
    };
  }

  async handleRespondToReview(args: RespondToReviewArgs): Promise<CallToolResult> {
    const review = await this.store.getReviewRequest(args.reviewId);

    if (!review) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Review with ID ${args.reviewId} not found`,
            }),
          },
        ],
      };
    }

    // In a real implementation, we might store the response separately
    // For now, we just acknowledge the review
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Response recorded for review ${args.reviewId}`,
            response: {
              reviewId: args.reviewId,
              respondedBy: args.agent,
              feedback: args.feedback,
              suggestions: args.suggestions,
              approved: args.approved,
              timestamp: new Date().toISOString(),
            },
          }),
        },
      ],
    };
  }

  async handleRespondToHelp(args: RespondToHelpArgs): Promise<CallToolResult> {
    const help = await this.store.getHelpRequest(args.helpId);

    if (!help) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Help request with ID ${args.helpId} not found`,
            }),
          },
        ],
      };
    }

    // In a real implementation, we might store the response separately
    // For now, we just acknowledge the help request
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Response recorded for help request ${args.helpId}`,
            response: {
              helpId: args.helpId,
              respondedBy: args.agent,
              response: args.response,
              additionalResources: args.additionalResources,
              timestamp: new Date().toISOString(),
            },
          }),
        },
      ],
    };
  }

  async handleSetContext(args: SetContextArgs): Promise<CallToolResult> {
    // Parse the value as JSON if it's a string
    let value: any = args.value;
    if (typeof args.value === 'string') {
      try {
        value = JSON.parse(args.value);
      } catch {
        // If it's not valid JSON, treat it as a plain string
        value = args.value;
      }
    }

    await this.store.setContext(args.key, value);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Context variable '${args.key}' set`,
            key: args.key,
            value,
          }),
        },
      ],
    };
  }

  async handleClearCompleted(args: ClearCompletedArgs): Promise<CallToolResult> {
    const clearedItems = {
      tasks: 0,
      reviews: 0,
      help: 0,
    };

    if (args.clearTasks) {
      const tasksBefore = await this.store.getAllTasks();
      await this.store.clearCompletedTasks();
      const tasksAfter = await this.store.getAllTasks();
      clearedItems.tasks = tasksBefore.length - tasksAfter.length;
    }

    if (args.clearReviews) {
      const reviewsBefore = await this.store.getAllReviews();
      // Use slice to get all reviews if length is 0, else use store's method
      if (reviewsBefore.length > 0) {
        await this.store.clearOldReviews(0); // This only clears if length > keepCount
      }
      const reviewsAfter = await this.store.getAllReviews();
      clearedItems.reviews = reviewsBefore.length - reviewsAfter.length;
    }

    if (args.clearHelp) {
      const helpBefore = await this.store.getAllHelp();
      // Use slice to get all help if length is 0, else use store's method
      if (helpBefore.length > 0) {
        await this.store.clearOldHelp(0); // This only clears if length > keepCount
      }
      const helpAfter = await this.store.getAllHelp();
      clearedItems.help = helpBefore.length - helpAfter.length;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Completed items cleared',
            clearedItems,
          }),
        },
      ],
    };
  }
}
