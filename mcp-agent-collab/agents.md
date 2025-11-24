# Agent Collaboration Architecture

## Overview

This MCP server enables real-time collaboration between Claude and GitHub Copilot (or other AI coding assistants) working on the same codebase. It provides a structured communication channel for:

- Code review requests and responses
- Help requests and knowledge sharing
- Task coordination and work division
- Progress tracking and status updates
- Shared context and state management

## Architecture

### Schema-Driven Design

The server is built using a schema-first approach with strongly-typed interfaces defined in `src/types.ts`:

- **ReviewRequest**: Structure for code review requests between agents
- **HelpRequest**: Format for asking questions and getting assistance
- **TaskProgress**: Tracking what each agent is working on
- **CoordinationPlan**: Dividing complex work between agents
- **CollaborationState**: Central state holding all collaboration data

### MCP Protocol Implementation

The server implements the Model Context Protocol specification:

1. **Resources**: Read-only state exposed via URIs
   - `collab://state/tasks` - Current task list
   - `collab://state/reviews` - Pending reviews
   - `collab://state/help` - Active help requests
   - `collab://state/coordination` - Coordination plans
   - `collab://state/context` - Shared variables

2. **Tools**: Actions agents can invoke
   - `request_review` - Ask for code review
   - `ask_for_help` - Request assistance
   - `share_progress` - Update task status
   - `coordinate_task` - Propose work division
   - `respond_to_review` - Provide review feedback
   - `respond_to_help` - Answer help requests
   - `set_shared_context` - Share information
   - `clear_completed` - Clean up old items

3. **Transport**: stdio-based communication
   - Server reads JSON-RPC requests from stdin
   - Writes JSON-RPC responses to stdout
   - Logs to stderr for debugging

## Data Flow

```
┌─────────────┐                  ┌─────────────────────┐                  ┌─────────────┐
│   Claude    │◄────── MCP ──────►│  Collaboration      │◄────── MCP ──────►│   Copilot   │
│             │      Client       │      Server         │      Client       │             │
└─────────────┘                  └─────────────────────┘                  └─────────────┘
      │                                    │                                      │
      │ 1. request_review                  │                                      │
      ├───────────────────────────────────►│                                      │
      │                                    │  Store review request                │
      │                                    ├─────────────┐                        │
      │                                    │             │                        │
      │                                    ◄─────────────┘                        │
      │                                    │                                      │
      │                                    │  2. Read collab://state/reviews      │
      │                                    │◄─────────────────────────────────────┤
      │                                    │                                      │
      │                                    │  Return review requests              │
      │                                    ├─────────────────────────────────────►│
      │                                    │                                      │
      │                                    │  3. respond_to_review                │
      │                                    │◄─────────────────────────────────────┤
      │                                    │                                      │
      │  4. Read collab://state/reviews    │                                      │
      │───────────────────────────────────►│                                      │
      │                                    │                                      │
      │  Return review with response       │                                      │
      │◄───────────────────────────────────┤                                      │
```

## State Management

The server maintains in-memory state in `CollaborationState`:

```typescript
{
  currentTasks: TaskProgress[],      // What each agent is working on
  reviewRequests: ReviewRequest[],   // Pending code reviews
  helpRequests: HelpRequest[],       // Active help requests
  coordinationPlans: CoordinationPlan[], // Work division plans
  sharedContext: Record<string, any> // Shared variables
}
```

State persists for the lifetime of the server process. For production use, consider adding:
- Persistence to disk/database
- Event subscriptions for real-time notifications
- Multi-project isolation
- Authentication and access control

## Use Cases

### 1. Code Review Workflow

**Copilot** implements a feature and wants Claude's review:

```typescript
// Copilot calls via MCP client
await mcp.callTool("request_review", {
  agent: "copilot",
  code: "function calculateTotal() { ... }",
  filePath: "src/utils/pricing.ts",
  context: "Implementing new pricing calculation with tax",
  concerns: ["Edge cases for international tax rates"]
});
```

**Claude** checks for reviews and responds:

```typescript
// Claude reads reviews
const reviews = await mcp.readResource("collab://state/reviews");

// Claude provides feedback
await mcp.callTool("respond_to_review", {
  reviewId: "review-123",
  agent: "claude",
  feedback: "Good implementation. Consider adding null checks...",
  suggestions: ["Add input validation", "Handle currency conversion"],
  approved: true
});
```

### 2. Getting Unstuck

**Claude** encounters a complex TypeScript generic issue:

```typescript
await mcp.callTool("ask_for_help", {
  agent: "claude",
  question: "How to constrain generic type T to have property 'id'?",
  context: "Working on generic repository pattern, TypeScript 5.7",
  urgency: "medium"
});
```

**Copilot** responds with solution:

```typescript
await mcp.callTool("respond_to_help", {
  helpId: "help-456",
  agent: "copilot",
  response: "Use constraint: `function repo<T extends { id: string }>()`",
  additionalResources: ["https://www.typescriptlang.org/docs/handbook/generics.html"]
});
```

### 3. Task Coordination

**Claude** proposes dividing a large feature:

```typescript
await mcp.callTool("coordinate_task", {
  agent: "claude",
  tasks: [
    {
      assignedTo: "copilot",
      description: "Implement API endpoints for user profile",
      priority: 1
    },
    {
      assignedTo: "claude",
      description: "Create React components for profile UI",
      priority: 2
    },
    {
      assignedTo: "copilot",
      description: "Write integration tests",
      priority: 3
    }
  ]
});
```

### 4. Progress Sharing

Both agents share updates:

```typescript
// Copilot updates progress
await mcp.callTool("share_progress", {
  agent: "copilot",
  task: "Implement API endpoints for user profile",
  status: "in_progress",
  details: "Completed GET /profile, working on POST /profile"
});

// Claude checks what Copilot is doing
const tasks = await mcp.readResource("collab://state/tasks");
```

### 5. Shared Context

Set shared architectural decisions:

```typescript
await mcp.callTool("set_shared_context", {
  key: "api_base_url",
  value: "https://api.example.com/v1"
});

await mcp.callTool("set_shared_context", {
  key: "auth_strategy",
  value: JSON.stringify({
    type: "JWT",
    storage: "httpOnly cookie",
    refreshEnabled: true
  })
});
```

## Extending the Server

### Adding New Tools

1. Define types in `src/types.ts`
2. Add tool definition in `ListToolsRequestSchema` handler
3. Implement tool logic in `CallToolRequestSchema` handler
4. Update documentation

### Adding Persistence

Replace in-memory state with database:

```typescript
import { Database } from './db.js';

const db = new Database();

// Replace state.reviewRequests.push(review) with:
await db.saveReviewRequest(review);
```

### Adding Notifications

Implement webhook or WebSocket notifications when new items arrive:

```typescript
function notifyAgents(event: string, data: any) {
  // Send webhook to Claude Code
  // Send notification to Copilot extension
}
```

## Security Considerations

- Server runs locally, no network exposure by default
- State is process-scoped, not shared across projects
- For multi-user scenarios, add authentication
- Sanitize code snippets before storage to prevent injection
- Consider rate limiting for high-frequency tool calls

## Performance

- In-memory state provides O(1) writes, O(n) reads
- Use `clear_completed` regularly to prevent unbounded growth
- Consider indexing by ID for large review/help request lists
- For high-volume usage, implement pagination on resources

## Future Enhancements

- [ ] WebSocket transport for real-time updates
- [ ] Persistent storage (SQLite/PostgreSQL)
- [ ] Multi-project workspace support
- [ ] Agent availability/presence status
- [ ] Conversation threading for discussions
- [ ] File attachment support for reviews
- [ ] Metrics and analytics dashboard
- [ ] Integration with project management tools
