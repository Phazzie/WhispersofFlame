# GitHub Copilot Instructions for Agent Collaboration

## MCP Agent Collaboration Server

**Purpose:** Real-time coordination between AI agents (Copilot ↔ Claude) working on the same codebase.

**Location:** `/workspaces/WhispersofFlame/mcp-agent-collab/`

**Status:** ✅ Production-ready (185/185 tests passing, CCR = 1.0)

### What It Does

Enables direct communication between AI agents to:
- **Request & provide code reviews** - Get feedback on implementations
- **Ask for help & share expertise** - Unblock each other when stuck
- **Coordinate tasks** - Divide work and avoid duplicates
- **Share progress** - Keep each other informed
- **Store shared context** - API endpoints, patterns, architectural decisions

### When to Use

**Use actively when:**
- Starting any non-trivial task → `share_progress`
- Writing complex code → `request_review`
- Stuck on a problem → `ask_for_help`
- Making architectural decisions → `set_shared_context`
- Before starting new work → Check `collab://state/tasks` for duplicates

**8 Available Tools:** `request_review`, `respond_to_review`, `ask_for_help`, `respond_to_help`, `share_progress`, `coordinate_task`, `set_shared_context`, `clear_completed`

**5 Resources:** `collab://state/tasks`, `collab://state/reviews`, `collab://state/help`, `collab://state/coordination`, `collab://state/context`

**Full Documentation:** See [MCPINFO.md](/workspaces/WhispersofFlame/MCPINFO.md) for complete API reference and examples.

---

## Quick Start

The MCP server is already built and ready to use. When connected to your MCP client, you'll have access to all collaboration tools.

## Available Tools

### 1. `request_review` - Get Code Review

Use when you've written code and want Claude's feedback.

**When to use:**
- You've implemented a complex feature
- You're unsure about edge cases
- You want a security/performance review
- You need architectural feedback

**Example:**
```json
{
  "agent": "copilot",
  "code": "async function fetchUserData(userId: string) {\n  const response = await fetch(`/api/users/${userId}`);\n  return response.json();\n}",
  "filePath": "src/services/userService.ts",
  "context": "Implementing user data fetching for profile page. Need to ensure proper error handling and type safety.",
  "concerns": ["Error handling", "Type safety", "Edge cases for invalid userId"]
}
```

**What happens:**
- Your review request is stored with a unique ID
- Claude will see it when checking `collab://state/reviews`
- Claude will respond using `respond_to_review`
- You can check back to see Claude's feedback

### 2. `ask_for_help` - Get Assistance

Use when you're stuck or need expertise.

**When to use:**
- You're getting errors you can't debug
- You need help with unfamiliar APIs/frameworks
- You want a second opinion on an approach
- You're blocked on a design decision

**Example:**
```json
{
  "agent": "copilot",
  "question": "How do I properly type a React component that accepts children and generic props?",
  "context": "Working on a reusable Card component. TypeScript 5.7, React 18. Getting error 'Type 'PropsWithChildren<T>' is not assignable...'",
  "urgency": "medium"
}
```

**Urgency levels:**
- `high`: Blocking your work, need immediate help
- `medium`: Important but can continue on other tasks
- `low`: Nice to know, not urgent

### 3. `share_progress` - Update Status

Use to keep Claude informed about what you're working on.

**When to use:**
- Starting a new task
- Making significant progress
- Getting blocked
- Completing a task

**Example:**
```json
{
  "agent": "copilot",
  "task": "Implement authentication endpoints",
  "status": "in_progress",
  "details": "Completed /login and /register endpoints. Working on /refresh-token. All tests passing so far."
}
```

**Status values:**
- `planning`: Thinking through approach
- `in_progress`: Actively coding
- `blocked`: Stuck, need help
- `completed`: Done

### 4. `coordinate_task` - Divide Work

Use when planning how to split a large feature between you and Claude.

**When to use:**
- Starting a complex multi-file feature
- Want to work in parallel efficiently
- Need to avoid merge conflicts
- Want to leverage each agent's strengths

**Example:**
```json
{
  "agent": "copilot",
  "tasks": [
    {
      "assignedTo": "copilot",
      "description": "Implement backend API endpoints and database models",
      "priority": 1
    },
    {
      "assignedTo": "claude",
      "description": "Create React components and connect to API",
      "priority": 2
    },
    {
      "assignedTo": "copilot",
      "description": "Write unit tests for API",
      "priority": 3
    },
    {
      "assignedTo": "claude",
      "description": "Write integration tests for full flow",
      "priority": 4
    }
  ]
}
```

### 5. `respond_to_review` - Provide Review Feedback

Use when Claude has requested your review of their code.

**When to use:**
- Claude used `request_review` and you see it in reviews
- You spot potential issues
- You have suggestions for improvement
- You want to approve Claude's implementation

**Example:**
```json
{
  "reviewId": "1732xxxxx-abc123",
  "agent": "copilot",
  "feedback": "Good implementation overall. The error handling is solid. One concern: the timeout is hardcoded at 5000ms - consider making it configurable.",
  "suggestions": [
    "Add timeout as a parameter with default value",
    "Consider adding retry logic for network failures",
    "Add JSDoc comments for public API"
  ],
  "approved": true
}
```

### 6. `respond_to_help` - Answer Help Requests

Use when Claude needs your help.

**Example:**
```json
{
  "helpId": "1732xxxxx-def456",
  "agent": "copilot",
  "response": "To type a React component with children and generic props, use: `function Card<T extends object>(props: PropsWithChildren<T>)`. Make sure to import PropsWithChildren from 'react'.",
  "additionalResources": [
    "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components/"
  ]
}
```

### 7. `set_shared_context` - Share Information

Use to set shared variables that both you and Claude can reference.

**When to use:**
- Defining API endpoints/URLs
- Setting architectural decisions
- Sharing configuration values
- Documenting patterns to follow

**Examples:**
```json
// Simple string value
{
  "key": "api_base_url",
  "value": "https://api.whispers-of-flame.com/v1"
}

// Complex object (as JSON string)
{
  "key": "database_schema",
  "value": "{\"users\": {\"id\": \"uuid\", \"email\": \"string\", \"created_at\": \"timestamp\"}, \"posts\": {\"id\": \"uuid\", \"user_id\": \"uuid\", \"content\": \"text\"}}"
}

// Architectural decision
{
  "key": "error_handling_pattern",
  "value": "Use Result<T, Error> types for all service methods, throw only in controllers"
}
```

### 8. `clear_completed` - Clean Up

Use periodically to keep the collaboration state clean.

**Example:**
```json
{
  "clearTasks": true,
  "clearReviews": false,
  "clearHelp": true
}
```

## Reading Collaboration State

You can read the current state using MCP resources:

### Check Current Tasks
**URI:** `collab://state/tasks`

See what Claude is working on and what you've shared.

### Check Review Requests
**URI:** `collab://state/reviews`

See pending code reviews from both you and Claude.

### Check Help Requests
**URI:** `collab://state/help`

See active help requests that need responses.

### Check Coordination Plans
**URI:** `collab://state/coordination`

See task division plans.

### Check Shared Context
**URI:** `collab://state/context`

Access all shared variables and decisions.

## Best Practices

### 1. Communicate Early and Often

Don't wait until you're stuck. Share progress regularly so Claude knows what you're doing and can jump in if needed.

### 2. Be Specific in Reviews

When requesting reviews, explain:
- What the code does
- Why you implemented it this way
- What you're uncertain about
- What edge cases you've considered

### 3. Provide Context in Help Requests

Include:
- What you're trying to accomplish
- What you've already tried
- The exact error messages
- Relevant environment details (versions, frameworks)

### 4. Use Urgency Appropriately

- Mark things `high` only when truly blocking
- Most requests should be `medium`
- Use `low` for nice-to-haves and learning questions

### 5. Coordinate on Large Features

Before starting a big feature:
1. Use `coordinate_task` to propose a plan
2. Wait for Claude's feedback
3. Adjust based on discussion
4. Both agents update progress regularly

### 6. Clean Up Regularly

Every few hours or when completing major work:
```json
{
  "clearTasks": true,
  "clearReviews": true,
  "clearHelp": true
}
```

## Example Collaboration Flow

### Scenario: Building a User Authentication System

**1. Copilot proposes coordination:**
```json
coordinate_task({
  "agent": "copilot",
  "tasks": [
    {"assignedTo": "copilot", "description": "Database schema and migrations", "priority": 1},
    {"assignedTo": "copilot", "description": "Auth API endpoints (login, register, logout)", "priority": 2},
    {"assignedTo": "claude", "description": "Auth UI components (login/register forms)", "priority": 3},
    {"assignedTo": "claude", "description": "Auth context and hooks for React", "priority": 4}
  ]
})
```

**2. Copilot starts work:**
```json
share_progress({
  "agent": "copilot",
  "task": "Database schema and migrations",
  "status": "in_progress",
  "details": "Creating users table with email, password_hash, created_at, updated_at"
})
```

**3. Copilot sets shared context:**
```json
set_shared_context({
  "key": "auth_endpoints",
  "value": "{\"login\": \"POST /api/auth/login\", \"register\": \"POST /api/auth/register\", \"logout\": \"POST /api/auth/logout\", \"refresh\": \"POST /api/auth/refresh\"}"
})
```

**4. Copilot completes backend, requests review:**
```json
request_review({
  "agent": "copilot",
  "code": "<full auth service code>",
  "filePath": "src/services/authService.ts",
  "context": "Implemented JWT-based auth with refresh tokens. Using bcrypt for password hashing.",
  "concerns": ["Token expiration handling", "Security best practices", "Rate limiting"]
})
```

**5. Meanwhile, Claude can read the endpoints from shared context and build UI:**
Claude reads `collab://state/context` and sees the endpoint definitions.

**6. Claude asks for clarification:**
```json
ask_for_help({
  "agent": "claude",
  "question": "What should the request/response format be for /api/auth/login?",
  "context": "Building login form, need to know expected payload shape and response structure",
  "urgency": "medium"
})
```

**7. Copilot responds:**
```json
respond_to_help({
  "helpId": "<id>",
  "agent": "copilot",
  "response": "Request: {email: string, password: string}. Response: {accessToken: string, refreshToken: string, user: {id: string, email: string}}",
  "additionalResources": ["See src/types/auth.ts for full type definitions"]
})
```

**8. Both agents update progress as they work**

**9. Final cleanup:**
```json
clear_completed({
  "clearTasks": true,
  "clearReviews": true,
  "clearHelp": true
})
```

## Tips for Effective Collaboration

1. **Don't duplicate work**: Check `collab://state/tasks` before starting something
2. **Review each other's code**: Build quality in from the start
3. **Share decisions**: Use `set_shared_context` for important architectural choices
4. **Ask questions**: Better to ask than to implement incorrectly
5. **Update status**: Keep task status current so Claude knows where you are
6. **Be detailed**: More context in requests = better responses
7. **Respond promptly**: When Claude asks for your help, prioritize responding

## Troubleshooting

### "Tool not found"
The MCP server isn't running or not connected. Check server status.

### "Review ID not found"
The review may have been cleared. Check `collab://state/reviews` for current reviews.

### "No response to my review request"
Claude may be busy or offline. You can continue work and check back later.

### State seems stale
The server maintains state in memory. If the server restarts, state is lost. This is normal - just re-establish context.

## Integration with Your Workflow

This MCP server is designed to be unobtrusive:
- Use it when helpful, ignore it when not needed
- No required workflow changes
- Opt-in for specific collaboration needs
- Falls back gracefully if server is unavailable

Think of it as having a teammate you can @ mention when you need them, but who doesn't interrupt when you're in flow.
