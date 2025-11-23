# MCP Agent Collaboration Server

Enable real-time collaboration between Claude Code and GitHub Copilot (or other AI coding assistants) on the same codebase.

## What This Does

This MCP (Model Context Protocol) server creates a communication channel that allows AI agents to:

- Request and provide code reviews
- Ask each other for help
- Coordinate task assignments
- Share progress updates
- Maintain shared context and decisions

Think of it as Slack/Teams for AI agents working on your code.

## Features

- **Code Review System**: Request reviews, provide feedback, approve/reject changes
- **Help Desk**: Ask questions, share expertise, unblock each other
- **Task Coordination**: Propose work division, track assignments
- **Progress Tracking**: Share status updates, avoid duplicate work
- **Shared Context**: Store architectural decisions, API endpoints, patterns
- **Clean State Management**: Clear completed items to keep collaboration focused

## Quick Start

### Installation

```bash
cd mcp-agent-collab
npm install
npm run build
```

### Running the Server

```bash
npm start
```

The server runs on stdio (standard input/output) and is designed to be used as an MCP server by Claude Code or other MCP clients.

### Configure Claude Code

Add to your Claude Code MCP settings (`~/.config/claude-code/mcp.json` or similar):

```json
{
  "mcpServers": {
    "agent-collab": {
      "command": "node",
      "args": ["/workspaces/WhispersofFlame/mcp-agent-collab/dist/index.js"],
      "env": {}
    }
  }
}
```

Restart Claude Code to load the server.

### Configure for GitHub Copilot

If using with an MCP-compatible Copilot client, add similar configuration pointing to the built server.

## Usage

### For Claude

Once configured, Claude can use these tools:

#### Request a review from Copilot
```typescript
// Call via MCP client
mcp.callTool("request_review", {
  agent: "claude",
  code: "function example() { ... }",
  filePath: "src/example.ts",
  context: "Implementing new feature X",
  concerns: ["Performance", "Type safety"]
});
```

#### Ask Copilot for help
```typescript
mcp.callTool("ask_for_help", {
  agent: "claude",
  question: "How to handle async errors in React?",
  context: "Building error boundary, React 18",
  urgency: "medium"
});
```

#### Share progress
```typescript
mcp.callTool("share_progress", {
  agent: "claude",
  task: "Implement user authentication UI",
  status: "in_progress",
  details: "Login form complete, working on registration"
});
```

#### Check what Copilot is doing
```typescript
// Read resource
const tasks = await mcp.readResource("collab://state/tasks");
```

### For Copilot

See [copilot-instructions.md](./copilot-instructions.md) for detailed instructions on how Copilot should use this server.

### Available Tools

| Tool | Purpose |
|------|---------|
| `request_review` | Ask the other agent to review your code |
| `ask_for_help` | Request assistance with a problem |
| `share_progress` | Update your current task status |
| `coordinate_task` | Propose how to divide work |
| `respond_to_review` | Provide review feedback |
| `respond_to_help` | Answer a help request |
| `set_shared_context` | Store shared information |
| `clear_completed` | Clean up old items |

### Available Resources

| Resource URI | Contents |
|--------------|----------|
| `collab://state/tasks` | Current task list |
| `collab://state/reviews` | Pending code reviews |
| `collab://state/help` | Active help requests |
| `collab://state/coordination` | Task coordination plans |
| `collab://state/context` | Shared variables and decisions |

## Example Workflow

### Scenario: Building a New Feature Together

1. **Claude proposes work division:**
   ```typescript
   coordinate_task({
     agent: "claude",
     tasks: [
       { assignedTo: "copilot", description: "Backend API", priority: 1 },
       { assignedTo: "claude", description: "Frontend UI", priority: 2 }
     ]
   });
   ```

2. **Both agents share progress:**
   ```typescript
   // Copilot
   share_progress({
     agent: "copilot",
     task: "Backend API",
     status: "in_progress"
   });

   // Claude
   share_progress({
     agent: "claude",
     task: "Frontend UI",
     status: "planning"
   });
   ```

3. **Copilot sets shared context:**
   ```typescript
   set_shared_context({
     key: "api_endpoint",
     value: "POST /api/users"
   });
   ```

4. **Claude reads the context and builds UI:**
   ```typescript
   const context = await readResource("collab://state/context");
   // Use api_endpoint from context
   ```

5. **Copilot requests review:**
   ```typescript
   request_review({
     agent: "copilot",
     code: "...",
     filePath: "src/api/users.ts",
     context: "New user creation endpoint"
   });
   ```

6. **Claude reviews and approves:**
   ```typescript
   respond_to_review({
     reviewId: "review-123",
     agent: "claude",
     feedback: "Looks good! Consider adding rate limiting.",
     approved: true
   });
   ```

## Architecture

See [agents.md](./agents.md) for detailed architecture documentation including:
- Schema-driven design
- MCP protocol implementation
- Data flow diagrams
- State management
- Extension points
- Security considerations

## Development

### Project Structure

```
mcp-agent-collab/
├── src/
│   ├── index.ts        # Main MCP server implementation
│   └── types.ts        # TypeScript type definitions
├── dist/               # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── README.md           # This file
├── agents.md           # Architecture documentation
└── copilot-instructions.md  # Copilot usage guide
```

### Building

```bash
npm run build        # Compile TypeScript
npm run watch        # Watch mode for development
```

### Testing

Currently the server is in initial development. To test:

1. Build the server: `npm run build`
2. Configure it in Claude Code's MCP settings
3. Restart Claude Code
4. Try calling tools via MCP client

### Adding New Tools

1. Define types in `src/types.ts`
2. Add tool schema to `ListToolsRequestSchema` handler
3. Implement tool logic in `CallToolRequestSchema` handler
4. Update documentation in `copilot-instructions.md` and `agents.md`

## Limitations

- **In-Memory State**: State is lost when server restarts
- **No Persistence**: For long-running collaboration, consider adding database storage
- **No Real-Time Notifications**: Agents must poll resources to see updates
- **Single Project**: No isolation between different codebases
- **No Authentication**: Assumes local, trusted environment

## Future Enhancements

Potential improvements for production use:

- [ ] Persistent storage (SQLite, PostgreSQL)
- [ ] WebSocket transport for real-time updates
- [ ] Multi-project workspace support
- [ ] Event subscriptions and webhooks
- [ ] Authentication and authorization
- [ ] Agent presence/availability status
- [ ] Conversation threading
- [ ] File attachments for code snippets
- [ ] Integration with issue trackers
- [ ] Analytics and metrics dashboard

## Troubleshooting

### Server won't start

- Check Node.js version (requires Node 18+)
- Verify dependencies are installed: `npm install`
- Build the TypeScript: `npm run build`
- Check for port conflicts (though server uses stdio)

### Tools not appearing in Claude Code

- Verify MCP configuration path is correct
- Restart Claude Code after config changes
- Check Claude Code logs for MCP connection errors
- Ensure server binary path is absolute

### State seems stale

- State is in-memory; restarting server clears all data
- Use `clear_completed` to clean up old items
- For persistence, consider implementing database backend

### Reviews/help requests not showing

- State is per-server-instance
- Ensure both agents are connected to the same server instance
- Check resource URIs are correct
- Verify server is running: check logs

## Contributing

This is an initial implementation. Contributions welcome:

- Bug fixes
- New collaboration tools
- Persistence layer
- Real-time notifications
- Better error handling
- Test coverage

## License

MIT

## Related Documentation

- [agents.md](./agents.md) - Detailed architecture and implementation
- [copilot-instructions.md](./copilot-instructions.md) - Guide for GitHub Copilot
- [MCP Specification](https://modelcontextprotocol.io/) - Model Context Protocol docs
- [Claude Code Documentation](https://github.com/anthropics/claude-code) - Claude Code usage

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the architecture documentation in `agents.md`
- File an issue in the parent repository
- Consult MCP and Claude Code documentation
