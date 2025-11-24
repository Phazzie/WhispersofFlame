#!/usr/bin/env node

/**
 * MCP Agent Collaboration Server
 *
 * SEAM-DRIVEN ARCHITECTURE:
 * This is now a thin orchestration layer that wires together
 * dependency-injected services. All business logic lives in seams.
 *
 * Enables Claude and GitHub Copilot to coordinate, request reviews,
 * ask for help, and share progress on collaborative coding tasks.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// SEAM IMPORTS - Dependency Injection
import type { ICollaborationStore } from "./contracts/ICollaborationStore.js";
import type { IIdGenerator } from "./contracts/IIdGenerator.js";
import type { IToolHandler } from "./contracts/IToolHandler.js";
import type { IResourceProvider } from "./contracts/IResourceProvider.js";

// REAL IMPLEMENTATIONS (can be swapped with mocks for testing)
import { InMemoryCollaborationStore } from "./services/InMemoryCollaborationStore.js";
import { RealIdGenerator } from "./services/RealIdGenerator.js";
import { ToolHandler } from "./services/ToolHandler.js";
import { ResourceProvider } from "./services/ResourceProvider.js";

/**
 * DEPENDENCY INJECTION SETUP
 *
 * All dependencies are created here and injected into services.
 * To swap implementations (e.g., use mocks), just change these lines.
 */
const store: ICollaborationStore = new InMemoryCollaborationStore();
const idGenerator: IIdGenerator = new RealIdGenerator();
const toolHandler: IToolHandler = new ToolHandler(store, idGenerator);
const resourceProvider: IResourceProvider = new ResourceProvider(store);

/**
 * MCP SERVER SETUP
 */
const server = new Server(
  {
    name: "agent-collaboration-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * LIST RESOURCES
 * Expose collaboration state as readable resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "collab://state/tasks",
        name: "Current Tasks",
        description: "View all active tasks being worked on by agents",
        mimeType: "application/json",
      },
      {
        uri: "collab://state/reviews",
        name: "Review Requests",
        description: "Pending code review requests between agents",
        mimeType: "application/json",
      },
      {
        uri: "collab://state/help",
        name: "Help Requests",
        description: "Active help requests from agents",
        mimeType: "application/json",
      },
      {
        uri: "collab://state/coordination",
        name: "Coordination Plans",
        description: "Task coordination and assignment plans",
        mimeType: "application/json",
      },
      {
        uri: "collab://state/context",
        name: "Shared Context",
        description: "Shared context and variables between agents",
        mimeType: "application/json",
      },
    ],
  };
});

/**
 * READ RESOURCE
 * Delegate to ResourceProvider (seam)
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    const resource = await resourceProvider.getResource(uri);
    return {
      contents: [resource],
    };
  } catch (error) {
    throw new Error(
      `Unknown resource: ${uri}. Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

/**
 * LIST TOOLS
 * Define collaboration tools available to agents
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "request_review",
        description: "Request a code review from the other agent. Use when you want feedback on implementation, potential bugs, or design decisions.",
        inputSchema: {
          type: "object",
          properties: {
            agent: {
              type: "string",
              enum: ["claude", "copilot"],
              description: "Which agent is requesting the review",
            },
            code: {
              type: "string",
              description: "The code to be reviewed",
            },
            filePath: {
              type: "string",
              description: "Path to the file containing this code",
            },
            context: {
              type: "string",
              description: "Context about what this code does and why you're implementing it this way",
            },
            concerns: {
              type: "array",
              items: { type: "string" },
              description: "Specific concerns or areas you want the reviewer to focus on",
            },
          },
          required: ["agent", "code", "filePath", "context"],
        },
      },
      {
        name: "ask_for_help",
        description: "Ask the other agent for help with a problem or question. Use when stuck, need expertise, or want a second opinion.",
        inputSchema: {
          type: "object",
          properties: {
            agent: {
              type: "string",
              enum: ["claude", "copilot"],
              description: "Which agent is asking for help",
            },
            question: {
              type: "string",
              description: "The question or problem you need help with",
            },
            context: {
              type: "string",
              description: "Relevant context, what you've tried, and why you're stuck",
            },
            urgency: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "How urgently you need help",
            },
          },
          required: ["agent", "question", "context", "urgency"],
        },
      },
      {
        name: "share_progress",
        description: "Share your current progress and status with the other agent. Use to keep collaborators informed about what you're working on.",
        inputSchema: {
          type: "object",
          properties: {
            agent: {
              type: "string",
              enum: ["claude", "copilot"],
              description: "Which agent is sharing progress",
            },
            task: {
              type: "string",
              description: "Description of the task you're working on",
            },
            status: {
              type: "string",
              enum: ["planning", "in_progress", "blocked", "completed"],
              description: "Current status of the task",
            },
            details: {
              type: "string",
              description: "Additional details about progress, blockers, or next steps",
            },
          },
          required: ["agent", "task", "status"],
        },
      },
      {
        name: "coordinate_task",
        description: "Propose a task coordination plan, dividing work between agents. Use when planning how to tackle a complex feature together.",
        inputSchema: {
          type: "object",
          properties: {
            agent: {
              type: "string",
              enum: ["claude", "copilot"],
              description: "Which agent is proposing the coordination",
            },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  assignedTo: {
                    type: "string",
                    enum: ["claude", "copilot"],
                  },
                  description: { type: "string" },
                  priority: { type: "number" },
                },
                required: ["assignedTo", "description", "priority"],
              },
              description: "List of tasks and their assignments",
            },
          },
          required: ["agent", "tasks"],
        },
      },
      {
        name: "respond_to_review",
        description: "Respond to a code review request with feedback and suggestions.",
        inputSchema: {
          type: "object",
          properties: {
            reviewId: {
              type: "string",
              description: "ID of the review request being responded to",
            },
            agent: {
              type: "string",
              enum: ["claude", "copilot"],
              description: "Which agent is responding",
            },
            feedback: {
              type: "string",
              description: "Detailed review feedback",
            },
            suggestions: {
              type: "array",
              items: { type: "string" },
              description: "Specific suggestions for improvement",
            },
            approved: {
              type: "boolean",
              description: "Whether the code is approved or needs changes",
            },
          },
          required: ["reviewId", "agent", "feedback", "approved"],
        },
      },
      {
        name: "respond_to_help",
        description: "Respond to a help request with guidance or solutions.",
        inputSchema: {
          type: "object",
          properties: {
            helpId: {
              type: "string",
              description: "ID of the help request being responded to",
            },
            agent: {
              type: "string",
              enum: ["claude", "copilot"],
              description: "Which agent is responding",
            },
            response: {
              type: "string",
              description: "Your response to the help request",
            },
            additionalResources: {
              type: "array",
              items: { type: "string" },
              description: "Links or references to helpful resources",
            },
          },
          required: ["helpId", "agent", "response"],
        },
      },
      {
        name: "set_shared_context",
        description: "Set a shared context variable that both agents can access. Use for sharing important information like API endpoints, architecture decisions, etc.",
        inputSchema: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description: "The context variable name",
            },
            value: {
              type: "string",
              description: "The value to store (will be JSON parsed if possible)",
            },
          },
          required: ["key", "value"],
        },
      },
      {
        name: "clear_completed",
        description: "Clear completed tasks and closed requests to keep the collaboration state clean.",
        inputSchema: {
          type: "object",
          properties: {
            clearTasks: { type: "boolean", description: "Clear completed tasks" },
            clearReviews: { type: "boolean", description: "Clear closed review requests" },
            clearHelp: { type: "boolean", description: "Clear resolved help requests" },
          },
        },
      },
    ],
  };
});

/**
 * CALL TOOL
 * Delegate to ToolHandler (seam)
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments for tool call");
  }

  // Route to appropriate handler method based on tool name
  switch (name) {
    case "request_review":
      return await toolHandler.handleRequestReview(args as any);

    case "ask_for_help":
      return await toolHandler.handleAskForHelp(args as any);

    case "share_progress":
      return await toolHandler.handleShareProgress(args as any);

    case "coordinate_task":
      return await toolHandler.handleCoordinateTask(args as any);

    case "respond_to_review":
      return await toolHandler.handleRespondToReview(args as any);

    case "respond_to_help":
      return await toolHandler.handleRespondToHelp(args as any);

    case "set_shared_context":
      return await toolHandler.handleSetContext(args as any);

    case "clear_completed":
      return await toolHandler.handleClearCompleted(args as any);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * START SERVER
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Agent Collaboration Server running on stdio");
  console.error("Architecture: Seam-Driven Development (SDD)");
  console.error("- Store: InMemoryCollaborationStore");
  console.error("- ID Generator: RealIdGenerator");
  console.error("- Tool Handler: ToolHandler");
  console.error("- Resource Provider: ResourceProvider");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
