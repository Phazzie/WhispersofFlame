/**
 * SEAM: MCP Tool Handler
 *
 * WHY: Decouple business logic from MCP protocol details.
 *      The MCP server should just route requests to handlers.
 *      Business logic should be testable without MCP infrastructure.
 *
 * WHAT: Handles all tool invocations (request_review, ask_for_help, etc.)
 *       Validates inputs, performs business logic, returns structured results.
 *
 * HOW: Each tool has a dedicated handler method.
 *      Takes parsed arguments, returns CallToolResult with content array.
 *      Uses ICollaborationStore for persistence.
 *
 * CONTRACT COMPLIANCE:
 *   - MockToolHandler can use in-memory state or MockCollaborationStore
 *   - RealToolHandler uses ICollaborationStore (injected dependency)
 *   - Both must return identical result structures for same inputs
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export interface RequestReviewArgs {
  agent: 'claude' | 'copilot';
  code: string;
  filePath: string;
  context: string;
  concerns?: string[];
}

export interface AskForHelpArgs {
  agent: 'claude' | 'copilot';
  question: string;
  context: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface ShareProgressArgs {
  agent: 'claude' | 'copilot';
  task: string;
  status: 'planning' | 'in_progress' | 'blocked' | 'completed';
  details?: string;
}

export interface CoordinateTaskArgs {
  agent: 'claude' | 'copilot';
  tasks: Array<{
    assignedTo: 'claude' | 'copilot';
    description: string;
    priority: number;
  }>;
}

export interface RespondToReviewArgs {
  reviewId: string;
  agent: 'claude' | 'copilot';
  feedback: string;
  suggestions?: string[];
  approved: boolean;
}

export interface RespondToHelpArgs {
  helpId: string;
  agent: 'claude' | 'copilot';
  response: string;
  additionalResources?: string[];
}

export interface SetContextArgs {
  key: string;
  value: string;
}

export interface ClearCompletedArgs {
  clearTasks?: boolean;
  clearReviews?: boolean;
  clearHelp?: boolean;
}

export interface IToolHandler {
  /**
   * Handle request_review tool invocation
   * Creates a new code review request
   */
  handleRequestReview(args: RequestReviewArgs): Promise<CallToolResult>;

  /**
   * Handle ask_for_help tool invocation
   * Creates a new help request
   */
  handleAskForHelp(args: AskForHelpArgs): Promise<CallToolResult>;

  /**
   * Handle share_progress tool invocation
   * Updates task progress for an agent
   */
  handleShareProgress(args: ShareProgressArgs): Promise<CallToolResult>;

  /**
   * Handle coordinate_task tool invocation
   * Creates a task coordination plan
   */
  handleCoordinateTask(args: CoordinateTaskArgs): Promise<CallToolResult>;

  /**
   * Handle respond_to_review tool invocation
   * Records a response to a code review request
   */
  handleRespondToReview(args: RespondToReviewArgs): Promise<CallToolResult>;

  /**
   * Handle respond_to_help tool invocation
   * Records a response to a help request
   */
  handleRespondToHelp(args: RespondToHelpArgs): Promise<CallToolResult>;

  /**
   * Handle set_shared_context tool invocation
   * Sets a shared context variable
   */
  handleSetContext(args: SetContextArgs): Promise<CallToolResult>;

  /**
   * Handle clear_completed tool invocation
   * Clears completed/old items from storage
   */
  handleClearCompleted(args: ClearCompletedArgs): Promise<CallToolResult>;
}
