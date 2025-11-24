/**
 * REAL IMPLEMENTATION: In-Memory Collaboration Store
 *
 * Purpose: Production-ready in-memory state storage
 * Use cases:
 *   - Production MCP server (current architecture)
 *   - Single-process deployments
 *   - Development and testing
 *
 * Behavior:
 *   - In-memory storage (state lost on restart)
 *   - Efficient lookups using Maps where appropriate
 *   - Must pass identical contract tests as mock implementation (CCR = 1.0)
 *
 * Future: Can be replaced with DatabaseCollaborationStore without changing consumers
 */

import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';
import type {
  ReviewRequest,
  HelpRequest,
  TaskProgress,
  CoordinationPlan,
} from '../types.js';

export class InMemoryCollaborationStore implements ICollaborationStore {
  private reviews: ReviewRequest[] = [];
  private helpRequests: HelpRequest[] = [];
  private tasks: TaskProgress[] = [];
  private plans: CoordinationPlan[] = [];
  private context: Map<string, any> = new Map();

  // ==================== REVIEW OPERATIONS ====================

  async addReviewRequest(review: ReviewRequest): Promise<string> {
    this.reviews.push(review);
    return review.id;
  }

  async getReviewRequest(id: string): Promise<ReviewRequest | null> {
    const review = this.reviews.find(r => r.id === id);
    return review || null;
  }

  async getAllReviews(): Promise<ReviewRequest[]> {
    // Return a copy to prevent external mutation
    return [...this.reviews];
  }

  async clearOldReviews(keepCount: number = 5): Promise<void> {
    if (this.reviews.length > keepCount) {
      // Keep only the most recent N reviews
      this.reviews = this.reviews.slice(-keepCount);
    }
  }

  // ==================== HELP OPERATIONS ====================

  async addHelpRequest(help: HelpRequest): Promise<string> {
    this.helpRequests.push(help);
    return help.id;
  }

  async getHelpRequest(id: string): Promise<HelpRequest | null> {
    const help = this.helpRequests.find(h => h.id === id);
    return help || null;
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
      // Update existing task
      this.tasks[existingIndex] = progress;
    } else {
      // Add new task
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
    this.context.set(key, value);
  }

  async getContext(key: string): Promise<any> {
    return this.context.get(key);
  }

  async getAllContext(): Promise<Record<string, any>> {
    // Convert Map to plain object
    const result: Record<string, any> = {};
    for (const [key, value] of this.context.entries()) {
      result[key] = value;
    }
    return result;
  }
}
