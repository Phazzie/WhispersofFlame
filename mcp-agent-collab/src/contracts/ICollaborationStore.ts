/**
 * SEAM: Collaboration State Storage
 *
 * WHY: Decouple state management from MCP protocol handling.
 *      This allows us to swap storage backends (in-memory, SQLite, PostgreSQL)
 *      without changing any code that uses the store.
 *
 * WHAT: Stores and retrieves all collaboration data including:
 *       - Code review requests and responses
 *       - Help requests and responses
 *       - Task progress updates
 *       - Coordination plans
 *       - Shared context variables
 *
 * HOW: Provides async CRUD operations for each entity type.
 *      All methods return Promises to support both sync (in-memory)
 *      and async (database) backends without interface changes.
 *
 * CONTRACT COMPLIANCE:
 *   - MockCollaborationStore must implement this interface
 *   - InMemoryCollaborationStore must implement this interface
 *   - Both must pass identical tests (CCR = 1.0)
 *   - Any future implementation (DatabaseCollaborationStore) must pass same tests
 */

import type {
  ReviewRequest,
  HelpRequest,
  TaskProgress,
  CoordinationPlan,
} from '../types.js';

export interface ICollaborationStore {
  // ==================== REVIEW OPERATIONS ====================

  /**
   * Add a new review request to the store
   * @param review - The review request to store
   * @returns The ID of the stored review
   */
  addReviewRequest(review: ReviewRequest): Promise<string>;

  /**
   * Retrieve a specific review request by ID
   * @param id - The review request ID
   * @returns The review request if found, null otherwise
   */
  getReviewRequest(id: string): Promise<ReviewRequest | null>;

  /**
   * Get all review requests
   * @returns Array of all review requests
   */
  getAllReviews(): Promise<ReviewRequest[]>;

  /**
   * Remove old review requests, keeping only the most recent N
   * @param keepCount - Number of recent reviews to keep (default: 5)
   */
  clearOldReviews(keepCount?: number): Promise<void>;

  // ==================== HELP OPERATIONS ====================

  /**
   * Add a new help request to the store
   * @param help - The help request to store
   * @returns The ID of the stored help request
   */
  addHelpRequest(help: HelpRequest): Promise<string>;

  /**
   * Retrieve a specific help request by ID
   * @param id - The help request ID
   * @returns The help request if found, null otherwise
   */
  getHelpRequest(id: string): Promise<HelpRequest | null>;

  /**
   * Get all help requests
   * @returns Array of all help requests
   */
  getAllHelp(): Promise<HelpRequest[]>;

  /**
   * Remove old help requests, keeping only the most recent N
   * @param keepCount - Number of recent help requests to keep (default: 5)
   */
  clearOldHelp(keepCount?: number): Promise<void>;

  // ==================== TASK OPERATIONS ====================

  /**
   * Update or add task progress for an agent
   * If a task with same agent and task name exists, it will be updated.
   * Otherwise, a new task is added.
   * @param progress - The task progress to store/update
   */
  updateTaskProgress(progress: TaskProgress): Promise<void>;

  /**
   * Get all current tasks
   * @returns Array of all task progress entries
   */
  getAllTasks(): Promise<TaskProgress[]>;

  /**
   * Remove completed tasks from the store
   */
  clearCompletedTasks(): Promise<void>;

  // ==================== COORDINATION OPERATIONS ====================

  /**
   * Add a new coordination plan
   * @param plan - The coordination plan to store
   * @returns The ID of the stored plan
   */
  addCoordinationPlan(plan: CoordinationPlan): Promise<string>;

  /**
   * Get all coordination plans
   * @returns Array of all coordination plans
   */
  getAllPlans(): Promise<CoordinationPlan[]>;

  // ==================== CONTEXT OPERATIONS ====================

  /**
   * Set a shared context variable
   * @param key - The context variable name
   * @param value - The value to store (any JSON-serializable value)
   */
  setContext(key: string, value: any): Promise<void>;

  /**
   * Get a shared context variable
   * @param key - The context variable name
   * @returns The value if it exists, undefined otherwise
   */
  getContext(key: string): Promise<any>;

  /**
   * Get all shared context variables
   * @returns Object containing all context key-value pairs
   */
  getAllContext(): Promise<Record<string, any>>;
}
