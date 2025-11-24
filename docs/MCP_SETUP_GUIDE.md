# MCP Setup Guide for Whispers of Flame

To connect the `mcp-agent-collab` server to your Claude Desktop or other MCP clients, you need to configure the client to run the server locally.

## Configuration File

The configuration file is typically named `claude_desktop_config.json`.

### Location
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Configuration Snippet

Add the following entry to your `mcpServers` object:

```json
{
  "mcpServers": {
    "whispers-collab": {
      "command": "node",
      "args": [
        "/absolute/path/to/WhispersofFlame/mcp-agent-collab/build/index.js"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Note:** You must run `npm run build` inside the `mcp-agent-collab` directory first to generate the `build/index.js` file.

## Building the Server

```bash
cd mcp-agent-collab
npm install
npm run build
```
