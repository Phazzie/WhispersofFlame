/**
 * REAL IMPLEMENTATION: Resource Provider
 *
 * Purpose: Production-ready resource provider for MCP server
 * Use cases:
 *   - MCP server resource endpoints
 *   - Production deployments
 *   - Development and testing
 *
 * Behavior:
 *   - Uses injected ICollaborationStore as dependency
 *   - Formats state data as JSON for MCP responses
 *   - Must pass identical contract tests as mock implementation (CCR = 1.0)
 *
 * Future: Can support additional storage backends by accepting any ICollaborationStore
 */

import type { IResourceProvider, ResourceContent } from '../contracts/IResourceProvider.js';
import type { ICollaborationStore } from '../contracts/ICollaborationStore.js';

export class ResourceProvider implements IResourceProvider {
  constructor(private store: ICollaborationStore) {}

  async getTasks(): Promise<ResourceContent> {
    const tasks = await this.store.getAllTasks();
    return {
      uri: 'collab://state/tasks',
      mimeType: 'application/json',
      text: JSON.stringify(tasks, null, 2),
    };
  }

  async getReviews(): Promise<ResourceContent> {
    const reviews = await this.store.getAllReviews();
    return {
      uri: 'collab://state/reviews',
      mimeType: 'application/json',
      text: JSON.stringify(reviews, null, 2),
    };
  }

  async getHelp(): Promise<ResourceContent> {
    const help = await this.store.getAllHelp();
    return {
      uri: 'collab://state/help',
      mimeType: 'application/json',
      text: JSON.stringify(help, null, 2),
    };
  }

  async getCoordination(): Promise<ResourceContent> {
    const plans = await this.store.getAllPlans();
    return {
      uri: 'collab://state/coordination',
      mimeType: 'application/json',
      text: JSON.stringify(plans, null, 2),
    };
  }

  async getContext(): Promise<ResourceContent> {
    const context = await this.store.getAllContext();
    return {
      uri: 'collab://state/context',
      mimeType: 'application/json',
      text: JSON.stringify(context, null, 2),
    };
  }

  async getResource(uri: string): Promise<ResourceContent> {
    switch (uri) {
      case 'collab://state/tasks':
        return this.getTasks();
      case 'collab://state/reviews':
        return this.getReviews();
      case 'collab://state/help':
        return this.getHelp();
      case 'collab://state/coordination':
        return this.getCoordination();
      case 'collab://state/context':
        return this.getContext();
      default:
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  }
}
