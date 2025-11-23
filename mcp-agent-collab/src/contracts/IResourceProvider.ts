/**
 * SEAM: MCP Resource Provider
 *
 * WHY: Decouple resource reading logic from MCP protocol.
 *      Makes it easy to test resource formatting without MCP infrastructure.
 *
 * WHAT: Provides read access to collaboration state via MCP resources.
 *       Formats state data as JSON strings for MCP resource responses.
 *
 * HOW: Each resource URI has a handler method.
 *      Uses ICollaborationStore to fetch current state.
 *      Returns formatted ResourceContent.
 *
 * CONTRACT COMPLIANCE:
 *   - MockResourceProvider can use MockCollaborationStore
 *   - RealResourceProvider uses ICollaborationStore (injected)
 *   - Both must return same structure for same state
 */

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

export interface IResourceProvider {
  /**
   * Get current tasks resource
   * URI: collab://state/tasks
   */
  getTasks(): Promise<ResourceContent>;

  /**
   * Get review requests resource
   * URI: collab://state/reviews
   */
  getReviews(): Promise<ResourceContent>;

  /**
   * Get help requests resource
   * URI: collab://state/help
   */
  getHelp(): Promise<ResourceContent>;

  /**
   * Get coordination plans resource
   * URI: collab://state/coordination
   */
  getCoordination(): Promise<ResourceContent>;

  /**
   * Get shared context resource
   * URI: collab://state/context
   */
  getContext(): Promise<ResourceContent>;

  /**
   * Get resource by URI
   * @param uri - The resource URI (e.g., "collab://state/tasks")
   * @returns The resource content
   * @throws Error if URI is unknown
   */
  getResource(uri: string): Promise<ResourceContent>;
}
