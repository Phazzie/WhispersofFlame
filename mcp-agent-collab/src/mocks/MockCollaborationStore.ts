/**
 * MOCK IMPLEMENTATION: CollaborationStore
 *
 * Purpose: Fast, predictable implementation for testing
 * Use cases:
 *   - Unit tests that need a store dependency
 *   - Fast CI/CD pipeline tests
 *   - Development without real infrastructure
 *
 * Behavior:
 *   - In-memory storage (just like real, but clearly marked as mock)
 *   - Simple, straightforward logic
 *   - No external dependencies
 *   - Must pass identical contract tests as real implementation (CCR = 1.0)
 */

import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';
import type {
  ReviewRequest,
  HelpRequest,
  TaskProgress,
  CoordinationPlan,
} from '../types.js';

export class MockCollaborationStore implements ICollaborationStore {
  private reviews: ReviewRequest[] = [];
  private helpRequests: HelpRequest[] = [];
  private tasks: TaskProgress[] = [];
  private plans: CoordinationPlan[] = [];
  private context: Record<string, any> = {};

  // ==================== REVIEW OPERATIONS ====================

  async addReviewRequest(review: ReviewRequest): Promise<string> {
    this.reviews.push(review);
    return review.id;
  }

  async getReviewRequest(id: string): Promise<ReviewRequest | null> {
    return this.reviews.find(r => r.id === id) || null;
  }

  async getAllReviews(): Promise<ReviewRequest[]> {
    return [...this.reviews];
  }

  async clearOldReviews(keepCount: number = 5): Promise<void> {
    if (this.reviews.length > keepCount) {
      this.reviews = this.reviews.slice(-keepCount);
    }
  }

  // ==================== HELP OPERATIONS ====================

  async addHelpRequest(help: HelpRequest): Promise<string> {
    this.helpRequests.push(help);
    return help.id;
  }

  async getHelpRequest(id: string): Promise<HelpRequest | null> {
    return this.helpRequests.find(h => h.id === id) || null;
  }

  async getAllHelp(): Promise<HelpRequest[]> {
    return [...this.helpRequests];
  }

  async clearOldHelp(keepCount: number = 5): Promise<void> {
    if (this.helpRequests.length > keepCount) {
      this.helpRequests = this.helpRequests.slice(-keepCount);
    }
  }

  // ==================== TASK OPERATIONS ====================

  async updateTaskProgress(progress: TaskProgress): Promise<void> {
    // Find existing task for same agent and task name
    const existingIndex = this.tasks.findIndex(
      t => t.agent === progress.agent && t.task === progress.task
    );

    if (existingIndex >= 0) {
      // Update existing
      this.tasks[existingIndex] = progress;
    } else {
      // Add new
      this.tasks.push(progress);
    }
  }

  async getAllTasks(): Promise<TaskProgress[]> {
    return [...this.tasks];
  }

  async clearCompletedTasks(): Promise<void> {
    this.tasks = this.tasks.filter(t => t.status !== 'completed');
  }

  // ==================== COORDINATION OPERATIONS ====================

  async addCoordinationPlan(plan: CoordinationPlan): Promise<string> {
    this.plans.push(plan);
    return plan.id;
  }

  async getAllPlans(): Promise<CoordinationPlan[]> {
    return [...this.plans];
  }

  // ==================== CONTEXT OPERATIONS ====================

  async setContext(key: string, value: any): Promise<void> {
    this.context[key] = value;
  }

  async getContext(key: string): Promise<any> {
    return this.context[key];
  }

  async getAllContext(): Promise<Record<string, any>> {
    return { ...this.context };
  }
}
