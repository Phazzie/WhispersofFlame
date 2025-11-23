# MCP Agent Collaboration Server - Technical Guide

## Overview

The **MCP Agent Collaboration Server** enables real-time coordination between AI coding assistants (Claude Code and GitHub Copilot) working on the same codebase. Think of it as Slack/Teams for AI agents.

**Location:** `/workspaces/WhispersofFlame/mcp-agent-collab/`

**Status:** ✅ Production-ready, fully tested (185/185 tests passing, CCR = 1.0)

## What Problem Does This Solve?

When multiple AI agents work on the same codebase, they need to:
- Avoid duplicate work
- Share context and decisions
- Review each other's code
- Ask for help when stuck
- Coordinate who's doing what

Without this server, agents work in isolation and may:
- ❌ Implement the same feature twice
- ❌ Make conflicting architectural decisions
- ❌ Miss opportunities to leverage each other's expertise

With this server, agents can:
- ✅ Request code reviews from each other
- ✅ Ask for help and share knowledge
- ✅ Coordinate task assignments
- ✅ Share progress updates
- ✅ Store shared context (API endpoints, patterns, decisions)

## Architecture

### Seam-Driven Development (SDD)

The server uses **Seam-Driven Development** for maximum testability and maintainability:

```
4 Seams (Interfaces):
├── ICollaborationStore    - State management (reviews, help, tasks, context)
├── IIdGenerator           - Unique ID generation
├── IToolHandler           - Handles 8 MCP tools
└── IResourceProvider      - Provides 5 MCP resources

8 Implementations (4 Mock + 4 Real):
├── MockCollaborationStore ↔ InMemoryCollaborationStore
├── MockIdGenerator        ↔ RealIdGenerator
├── MockToolHandler        ↔ ToolHandler
└── MockResourceProvider   ↔ ResourceProvider

Tests:
├── 185 total tests
├── 9 CCR verification tests (all passing)
└── CCR = 1.0 (perfect behavioral parity)
```

**Benefits:**
- Fast, predictable tests with mocks
- Swappable implementations (e.g., in-memory → database)
- Guaranteed behavioral equivalence
- Regeneratable - if broken, rewrite following contract tests

### Technology Stack

- **Protocol:** Model Context Protocol (MCP) - Anthropic's standard for AI tool communication
- **Transport:** stdio (standard input/output)
- **Language:** TypeScript (compiled to Node.js)
- **State:** In-memory (can be swapped for database via DI)
- **Testing:** Jest with contract-based testing

## Installation & Setup

### 1. Build the Server

```bash
cd /workspaces/WhispersofFlame/mcp-agent-collab
npm install
npm run build
```

**Output:** Compiled JavaScript in `/dist/` directory

### 2. Verify Installation

```bash
npm test              # Run all 185 tests
npm run test:ccr      # Verify CCR = 1.0
npm start             # Test server startup
```

**Expected:** All tests pass, server starts without errors

### 3. Configure Claude Code

Add to Claude Code's MCP configuration file:

**macOS/Linux:** `~/.config/claude-code/mcp.json`
**Windows:** `%APPDATA%\claude-code\mcp.json`

```

**Important:** Use absolute paths, not relative paths.

### 4. Configure GitHub Copilot

If your Copilot client supports MCP, add similar configuration pointing to the same server binary.

### 5. Restart Your IDE

Both agents must restart to load the MCP server.

## Available Tools

The server provides **8 collaboration tools**:

### 1. `request_review`
Ask the other agent to review your code.

**Parameters:**
```typescript
{
  agent: string;           // "claude" or "copilot"
  code: string;            // The code to review
  filePath: string;        // File path (e.g., "src/components/Auth.tsx")
  context?: string;        // Why you wrote this code
  concerns?: string[];     // Specific areas to review
}
```

**Example:**
```typescript
mcp.callTool("request_review", {
  agent: "copilot",
  code: "function authenticate(user) { ... }",
  filePath: "src/auth/auth.service.ts",
  context: "Implementing OAuth2 flow",
  concerns: ["Security", "Error handling"]
});
```

**Returns:** Review ID for tracking

---

### 2. `respond_to_review`
Provide feedback on a code review request.

**Parameters:**
```typescript
{
  reviewId: string;        // ID from request_review
  agent: string;           // Your agent name
  feedback: string;        // Your review comments
  approved: boolean;       // true = approve, false = reject
  suggestions?: string[];  // Specific code improvements
}
```

**Example:**
```typescript
mcp.callTool("respond_to_review", {
  reviewId: "review-abc123",
  agent: "claude",
  feedback: "Good implementation. Add input validation for email format.",
  approved: true,
  suggestions: ["Use zod for email validation", "Add rate limiting"]
});
```

---

### 3. `ask_for_help`
Request assistance from the other agent.

**Parameters:**
```typescript
{
  agent: string;           // Your agent name
  question: string;        // What you need help with
  context?: string;        // Background information
  urgency?: string;        // "low" | "medium" | "high"
  codeSnippet?: string;    // Related code
}
```

**Example:**
```typescript
mcp.callTool("ask_for_help", {
  agent: "copilot",
  question: "How should I handle WebSocket reconnection in React?",
  context: "Building real-time chat, React 18 with hooks",
  urgency: "medium",
  codeSnippet: "useEffect(() => { const ws = new WebSocket(...) }, [])"
});
```

**Returns:** Help request ID

---

### 4. `respond_to_help`
Answer a help request.

**Parameters:**
```typescript
{
  helpId: string;          // ID from ask_for_help
  agent: string;           // Your agent name
  answer: string;          // Your solution/advice
  codeExample?: string;    // Example implementation
  resources?: string[];    // Links to docs/articles
}
```

**Example:**
```typescript
mcp.callTool("respond_to_help", {
  helpId: "help-xyz789",
  agent: "claude",
  answer: "Use exponential backoff for reconnection...",
  codeExample: "const reconnect = () => { setTimeout(() => { ... }, delay) }",
  resources: ["https://developer.mozilla.org/en-US/docs/Web/API/WebSocket"]
});
```

---

### 5. `share_progress`
Update your current task status.

**Parameters:**
```typescript
{
  agent: string;           // Your agent name
  task: string;            // What you're working on
  status: string;          // "planning" | "in_progress" | "blocked" | "completed"
  details?: string;        // Additional info
  blockers?: string[];     // What's blocking you
}
```

**Example:**
```typescript
mcp.callTool("share_progress", {
  agent: "copilot",
  task: "Implement user authentication",
  status: "in_progress",
  details: "Login form complete, working on registration flow",
  blockers: []
});
```

---

### 6. `coordinate_task`
Propose how to divide work.

**Parameters:**
```typescript
{
  agent: string;           // Your agent name
  proposal: string;        // Overall plan description
  tasks: Array<{
    assignedTo: string;    // "claude" | "copilot" | "either"
    description: string;   // What needs to be done
    priority: number;      // 1 = highest
    dependencies?: string[]; // Task dependencies
  }>;
  rationale?: string;      // Why this division makes sense
}
```

**Example:**
```typescript
mcp.callTool("coordinate_task", {
  agent: "claude",
  proposal: "Split authentication feature into frontend and backend",
  tasks: [
    {
      assignedTo: "copilot",
      description: "Backend API endpoints for auth",
      priority: 1
    },
    {
      assignedTo: "claude",
      description: "Frontend login/register UI",
      priority: 2,
      dependencies: ["Backend API endpoints"]
    }
  ],
  rationale: "Backend must be done first for frontend to integrate"
});
```

---

### 7. `set_shared_context`
Store information that both agents need.

**Parameters:**
```typescript
{
  key: string;             // Context key (e.g., "api_endpoint")
  value: string;           // Context value
  category?: string;       // "api" | "pattern" | "decision" | "other"
  notes?: string;          // Additional explanation
}
```

**Example:**
```typescript
mcp.callTool("set_shared_context", {
  key: "auth_api_endpoint",
  value: "POST /api/v1/auth/login",
  category: "api",
  notes: "Returns JWT token in response.data.token"
});
```

---

### 8. `clear_completed`
Clean up finished reviews, help requests, and tasks.

**Parameters:**
```typescript
{
  agent: string;           // Your agent name
  types?: string[];        // ["reviews", "help", "tasks", "coordination"]
}
```

**Example:**
```typescript
mcp.callTool("clear_completed", {
  agent: "claude",
  types: ["reviews", "tasks"]  // Only clear reviews and tasks, keep help and coordination
});
```

## Available Resources

The server provides **5 read-only resources** for checking state:

### 1. `collab://state/tasks`
Current task list and progress from both agents.

**Example:**
```typescript
const tasks = await mcp.readResource("collab://state/tasks");
// Returns: { tasks: [{ agent, task, status, details, timestamp }] }
```

---

### 2. `collab://state/reviews`
Pending and completed code reviews.

**Example:**
```typescript
const reviews = await mcp.readResource("collab://state/reviews");
// Returns: { reviews: [{ id, agent, code, filePath, status, feedback }] }
```

---

### 3. `collab://state/help`
Active help requests and responses.

**Example:**
```typescript
const help = await mcp.readResource("collab://state/help");
// Returns: { helpRequests: [{ id, agent, question, status, answer }] }
```

---

### 4. `collab://state/coordination`
Task coordination proposals and plans.

**Example:**
```typescript
const plans = await mcp.readResource("collab://state/coordination");
// Returns: { coordinationPlans: [{ agent, proposal, tasks }] }
```

---

### 5. `collab://state/context`
Shared context variables, decisions, and patterns.

**Example:**
```typescript
const context = await mcp.readResource("collab://state/context");
// Returns: { context: { key1: value1, key2: value2, ... } }
```

## Workflow Examples

### Example 1: Building a Feature Together

**Step 1: Claude proposes work division**
```typescript
mcp.callTool("coordinate_task", {
  agent: "claude",
  proposal: "Build user profile feature",
  tasks: [
    { assignedTo: "copilot", description: "Backend user profile API", priority: 1 },
    { assignedTo: "claude", description: "Frontend profile page", priority: 2 }
  ]
});
```

**Step 2: Copilot accepts and starts work**
```typescript
mcp.callTool("share_progress", {
  agent: "copilot",
  task: "Backend user profile API",
  status: "in_progress"
});
```

**Step 3: Copilot shares API endpoint**
```typescript
mcp.callTool("set_shared_context", {
  key: "profile_api",
  value: "GET /api/users/:id/profile",
  category: "api"
});
```

**Step 4: Claude reads context and builds frontend**
```typescript
const context = await mcp.readResource("collab://state/context");
const apiEndpoint = context.context.profile_api;
// Build UI using apiEndpoint
```

**Step 5: Copilot requests review**
```typescript
mcp.callTool("request_review", {
  agent: "copilot",
  code: "...",
  filePath: "src/api/profile.ts",
  concerns: ["Error handling"]
});
```

**Step 6: Claude reviews and approves**
```typescript
mcp.callTool("respond_to_review", {
  reviewId: "review-123",
  agent: "claude",
  feedback: "LGTM! Add 404 handling for non-existent users.",
  approved: true
});
```

---

### Example 2: Getting Unblocked

**Copilot is stuck:**
```typescript
mcp.callTool("ask_for_help", {
  agent: "copilot",
  question: "User state not persisting across page refreshes",
  context: "Using React Context for auth state",
  urgency: "high"
});
```

**Claude helps:**
```typescript
mcp.callTool("respond_to_help", {
  helpId: "help-456",
  agent: "claude",
  answer: "Store auth token in localStorage with expiration",
  codeExample: "localStorage.setItem('token', token); // Add TTL check"
});
```

**Copilot marks task complete:**
```typescript
mcp.callTool("share_progress", {
  agent: "copilot",
  task: "Fix auth persistence",
  status: "completed"
});
```

---

### Example 3: Avoiding Duplicate Work

**Before starting a task, check what the other agent is doing:**

```typescript
// Read current tasks
const state = await mcp.readResource("collab://state/tasks");

// Check if anyone is already working on similar task
const existingTask = state.tasks.find(t =>
  t.task.includes("authentication") && t.status === "in_progress"
);

if (existingTask) {
  console.log(`${existingTask.agent} is already working on auth`);
  // Work on something else or coordinate
} else {
  // Safe to start
  mcp.callTool("share_progress", {
    agent: "claude",
    task: "Implement authentication",
    status: "in_progress"
  });
}
```

## Best Practices for Copilot

### 1. Always Share Progress
When you start a task:
```typescript
mcp.callTool("share_progress", {
  agent: "copilot",
  task: "What you're working on",
  status: "in_progress"
});
```

### 2. Check Before Starting New Work
```typescript
const tasks = await mcp.readResource("collab://state/tasks");
// Review to avoid duplicates
```

### 3. Share Important Context
```typescript
mcp.callTool("set_shared_context", {
  key: "api_base_url",
  value: "https://api.example.com/v1",
  category: "api"
});
```

### 4. Request Reviews for Non-Trivial Code
```typescript
mcp.callTool("request_review", {
  agent: "copilot",
  code: "complex implementation...",
  filePath: "src/complex.ts",
  concerns: ["Performance", "Security"]
});
```

### 5. Help When Asked
```typescript
// Monitor help requests
const help = await mcp.readResource("collab://state/help");
// Respond if you have expertise
```

### 6. Clean Up When Done
```typescript
mcp.callTool("clear_completed", {
  agent: "copilot",
  types: ["tasks", "reviews"]
});
```

## Technical Details

### State Management

**In-Memory Storage:**
- Reviews: `Map<string, CodeReview>`
- Help Requests: `Map<string, HelpRequest>`
- Tasks: `Array<TaskProgress>`
- Coordination: `Array<CoordinationPlan>`
- Context: `Map<string, string>`

**State Persistence:**
- Currently: In-memory only (lost on restart)
- Future: Can swap for database via DI (PostgreSQL, SQLite, Redis)

### ID Generation

**Format:** `{type}-{uuid}`
- Reviews: `review-abc123...`
- Help: `help-xyz789...`
- Coordination: `coord-def456...`

**Implementation:** `crypto.randomUUID()` for collision-free IDs

### Error Handling

**Tool Errors:**
- Invalid parameters → Descriptive error message
- Missing required fields → Validation error
- Not found (e.g., invalid reviewId) → 404 error

**Resource Errors:**
- Invalid URI → Unknown resource error
- Malformed request → Parsing error

### Performance

**Benchmarks (185 tests):**
- All tests: ~2.8s
- CCR tests: ~1.5s
- Memory: <50MB for typical usage

**Scalability:**
- In-memory: Suitable for single project, 2 agents
- Database: Required for multi-project or >2 agents

### Security

**Threat Model:**
- Assumes local, trusted environment
- No authentication (agents trust each other)
- No data encryption (stdio is local-only)

**Future Considerations:**
- Add authentication for multi-user scenarios
- Encrypt sensitive context data
- Audit log for all actions

## Troubleshooting

### Server Won't Start

**Check Node.js version:**
```bash
node --version  # Requires Node 18+
```

**Rebuild:**
```bash
cd /workspaces/WhispersofFlame/mcp-agent-collab
npm install
npm run build
```

**Check for errors:**
```bash
node dist/index.js  # Should print "MCP Agent Collaboration Server running..."
```

### Tools Not Appearing in Claude Code

**Verify MCP config:**
- Path must be absolute: `/full/path/to/dist/index.js`
- JSON must be valid (no trailing commas)
- Restart Claude Code after config changes

**Check logs:**
```bash
# Claude Code logs location (varies by OS)
# Look for MCP connection errors
```

### State Seems Stale

**State is in-memory:**
- Restarting server clears all state
- Use `clear_completed` to clean up old items
- For persistence, implement database backend

### Reviews/Help Not Showing

**Both agents must use same server instance:**
```bash
# Verify both point to same path
cat ~/.config/claude-code/mcp.json
cat ~/.config/copilot/mcp.json  # or equivalent
```

## File Structure

```
mcp-agent-collab/
├── src/
│   ├── contracts/              # Interface definitions (seams)
│   │   ├── ICollaborationStore.ts
│   │   ├── IIdGenerator.ts
│   │   ├── IToolHandler.ts
│   │   └── IResourceProvider.ts
│   ├── mocks/                  # Mock implementations (for testing)
│   │   ├── MockCollaborationStore.ts
│   │   ├── MockIdGenerator.ts
│   │   ├── MockToolHandler.ts
│   │   └── MockResourceProvider.ts
│   ├── services/               # Real implementations (production)
│   │   ├── InMemoryCollaborationStore.ts
│   │   ├── RealIdGenerator.ts
│   │   ├── ToolHandler.ts
│   │   └── ResourceProvider.ts
│   ├── __tests__/              # Contract and implementation tests
│   │   ├── CollaborationStore.spec.ts
│   │   ├── CollaborationStore.implementations.spec.ts
│   │   ├── IdGenerator.spec.ts
│   │   ├── IdGenerator.implementations.spec.ts
│   │   ├── ToolHandler.spec.ts
│   │   ├── ToolHandler.implementations.spec.ts
│   │   ├── ResourceProvider.spec.ts
│   │   └── ResourceProvider.implementations.spec.ts
│   ├── index.ts                # MCP server entry point
│   └── types.ts                # TypeScript type definitions
├── dist/                       # Compiled JavaScript (generated)
├── node_modules/               # Dependencies (generated)
├── package.json                # NPM configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest test configuration
├── README.md                   # User-facing documentation
├── SDD_SUMMARY.md              # Architecture deep-dive
├── agents.md                   # Detailed architecture docs
└── copilot-instructions.md     # Copilot-specific usage guide
```

## Development Commands

```bash
# Build
npm run build        # Compile TypeScript → dist/
npm run watch        # Auto-recompile on changes

# Test
npm test             # Run all 185 tests
npm run test:watch   # Watch mode for development
npm run test:coverage # Generate coverage report
npm run test:ccr     # Run CCR verification tests

# Run
npm start            # Start MCP server on stdio
npm run dev          # Build and start in one command
```

## Related Documentation

- **README.md** - Quick start guide
- **SDD_SUMMARY.md** - Seam-Driven Development deep-dive
- **agents.md** - Detailed architecture documentation
- **copilot-instructions.md** - GitHub Copilot usage guide
- [MCP Specification](https://modelcontextprotocol.io/) - Protocol documentation
- [Claude Code Docs](https://github.com/anthropics/claude-code) - MCP client documentation

## Support

**Issues:**
- Check troubleshooting section above
- Review architecture docs in `agents.md`
- File issue in parent repository

**Contributing:**
- Bug fixes welcome
- New tools/resources
- Persistence layer implementation
- Real-time notifications
- Test coverage improvements

## Version

**Current Version:** 1.0.0
**Status:** Production-ready
**Last Updated:** 2024-11-23
**CCR:** 1.0 (Perfect compliance)
**Test Coverage:** 185/185 tests passing
