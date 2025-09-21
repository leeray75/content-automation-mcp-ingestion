# MCP Inspector Reference Documentation

**Source**: https://www.npmjs.com/package/@modelcontextprotocol/inspector  
**Version**: 0.16.8  
**Last Updated**: September 21, 2025  
**License**: MIT

## Overview

The MCP Inspector is a developer tool for testing and debugging MCP servers. It provides both a visual UI interface and a command-line interface for comprehensive MCP server development and testing.

![MCP Inspector Screenshot](https://raw.githubusercontent.com/modelcontextprotocol/inspector/main/mcp-inspector.png)

## Architecture

The MCP Inspector consists of two main components:

- **MCP Inspector Client (MCPI)**: React-based web UI for interactive testing and debugging
- **MCP Proxy (MCPP)**: Node.js server that acts as a protocol bridge, connecting the web UI to MCP servers via various transport methods (stdio, SSE, streamable-http)

> **Note**: The proxy is not a network proxy for intercepting traffic. It functions as both an MCP client (connecting to your MCP server) and an HTTP server (serving the web UI).

## Requirements

- **Node.js**: ^22.7.5

## Installation & Usage

### Quick Start (UI Mode)

```bash
npx @modelcontextprotocol/inspector
```

The server will start and the UI will be accessible at `http://localhost:6274`.

### Docker Container

```bash
docker run --rm --network host -p 6274:6274 -p 6277:6277 ghcr.io/modelcontextprotocol/inspector:latest
```

### Testing Your MCP Server

```bash
# Basic server testing
npx @modelcontextprotocol/inspector node build/index.js

# With arguments
npx @modelcontextprotocol/inspector node build/index.js arg1 arg2

# With environment variables
npx @modelcontextprotocol/inspector -e key=value -e key2=$VALUE2 node build/index.js

# Both environment variables and arguments
npx @modelcontextprotocol/inspector -e key=value -e key2=$VALUE2 node build/index.js arg1 arg2

# Separate inspector flags from server arguments
npx @modelcontextprotocol/inspector -e key=$VALUE -- node build/index.js -e server-flag
```

### Custom Ports

The inspector runs two services:
- **MCP Inspector (MCPI) client UI**: Default port 6274
- **MCP Proxy (MCPP) server**: Default port 6277

```bash
CLIENT_PORT=8080 SERVER_PORT=9000 npx @modelcontextprotocol/inspector node build/index.js
```

> **Port Mnemonic**: Ports 6274 and 6277 are derived from T9 dialpad mapping of MCPI and MCPP respectively.

## Security Features

### Authentication (Required by Default)

The MCP Inspector proxy server requires authentication by default. When starting, a random session token is generated:

```
🔑 Session token: 3a1c267fad21f7150b7d624c160b7f09b0b8c4f623c7107bbf13378f051538d4

🔗 Open inspector with token pre-filled:
   http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=3a1c267fad21f7150b7d624c160b7f09b0b8c4f623c7107bbf13378f051538d4
```

**Automatic browser opening**: The inspector automatically opens your browser with the token pre-filled.

**Manual configuration**: If you already have the inspector open:
1. Click the "Configuration" button in the sidebar
2. Find "Proxy Session Token" and enter the token
3. Click "Save" to apply

**Custom token**: Set via environment variable:
```bash
MCP_PROXY_AUTH_TOKEN=$(openssl rand -hex 32) npm start
```

### ⚠️ Disabling Authentication (NOT RECOMMENDED)

```bash
DANGEROUSLY_OMIT_AUTH=true npm start
```

> **🚨 WARNING**: Disabling authentication is extremely dangerous! It leaves your machine open to attack via web browsers, including malicious websites or advertisements. Only disable if you truly understand the risks.

### Local-only Binding

By default, both services bind only to `localhost`. To bind to all interfaces:

```bash
HOST=0.0.0.0 npm start
```

> **Warning**: Only bind to all interfaces in trusted network environments.

### DNS Rebinding Protection

The Inspector validates the `Origin` header. Configure additional allowed origins:

```bash
ALLOWED_ORIGINS=http://localhost:6274,http://localhost:8000 npm start
```

## Configuration

### Runtime Configuration

Access via the `Configuration` button in the UI:

| Setting | Description | Default |
|---------|-------------|---------|
| `MCP_SERVER_REQUEST_TIMEOUT` | Timeout for requests to MCP server (ms) | 10000 |
| `MCP_REQUEST_TIMEOUT_RESET_ON_PROGRESS` | Reset timeout on progress notifications | true |
| `MCP_REQUEST_MAX_TOTAL_TIMEOUT` | Maximum total timeout for requests (ms) | 60000 |
| `MCP_PROXY_FULL_ADDRESS` | Custom proxy address | "" |
| `MCP_AUTO_OPEN_ENABLED` | Enable automatic browser opening | true |

### Configuration Files

Use configuration files for multiple servers:

```bash
npx @modelcontextprotocol/inspector --config path/to/config.json --server everything
```

**Example configuration file:**

```json
{
  "mcpServers": {
    "everything": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-everything"],
      "env": {
        "hello": "Hello MCP!"
      }
    },
    "my-server": {
      "command": "node",
      "args": ["build/index.js", "arg1", "arg2"],
      "env": {
        "key": "value",
        "key2": "value2"
      }
    }
  }
}
```

### Transport Types in Config Files

**STDIO (default):**
```json
{
  "mcpServers": {
    "my-stdio-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-everything"]
    }
  }
}
```

**SSE (Server-Sent Events):**
```json
{
  "mcpServers": {
    "my-sse-server": {
      "type": "sse",
      "url": "http://localhost:3000/sse"
    }
  }
}
```

**Streamable HTTP:**
```json
{
  "mcpServers": {
    "my-http-server": {
      "type": "streamable-http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Default Server Selection

The inspector automatically selects:
1. **Single server** in config - automatically selected
2. **Server named "default-server"** - automatically selected

```bash
# Automatically uses single server or "default-server"
npx @modelcontextprotocol/inspector --config mcp.json
```

### URL Parameters

Set initial configuration via query parameters:

```
# Transport and server settings
http://localhost:6274/?transport=sse&serverUrl=http://localhost:8787/sse
http://localhost:6274/?transport=streamable-http&serverUrl=http://localhost:8787/mcp
http://localhost:6274/?transport=stdio&serverCommand=npx&serverArgs=arg1%20arg2

# Configuration settings
http://localhost:6274/?MCP_SERVER_REQUEST_TIMEOUT=10000&MCP_REQUEST_TIMEOUT_RESET_ON_PROGRESS=false
```

## Servers File Export

The Inspector provides convenient export buttons for client configurations:

### Server Entry Button
Copies a single server configuration entry:

**STDIO transport:**
```json
{
  "command": "node",
  "args": ["build/index.js", "--debug"],
  "env": {
    "API_KEY": "your-api-key",
    "DEBUG": "true"
  }
}
```

**SSE transport:**
```json
{
  "type": "sse",
  "url": "http://localhost:3000/events",
  "note": "For SSE connections, add this URL directly in Client"
}
```

**Streamable HTTP transport:**
```json
{
  "type": "streamable-http",
  "url": "http://localhost:3000/mcp",
  "note": "For Streamable HTTP connections, add this URL directly in your MCP Client"
}
```

### Servers File Button
Copies a complete MCP configuration file structure:

```json
{
  "mcpServers": {
    "default-server": {
      "command": "node",
      "args": ["build/index.js", "--debug"],
      "env": {
        "API_KEY": "your-api-key",
        "DEBUG": "true"
      }
    }
  }
}
```

## CLI Mode

CLI mode enables programmatic interaction with MCP servers, ideal for scripting and automation.

### Basic CLI Usage

```bash
# Basic usage
npx @modelcontextprotocol/inspector --cli node build/index.js

# With config file
npx @modelcontextprotocol/inspector --cli --config path/to/config.json --server myserver
```

### Tools Operations

```bash
# List available tools
npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/list

# Call a specific tool
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method tools/call \
  --tool-name mytool \
  --tool-arg key=value \
  --tool-arg another=value2

# Call a tool with JSON arguments
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method tools/call \
  --tool-name mytool \
  --tool-arg 'options={"format": "json", "max_tokens": 100}'
```

### Resources Operations

```bash
# List available resources
npx @modelcontextprotocol/inspector --cli node build/index.js --method resources/list

# Read a specific resource
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method resources/read \
  --resource-uri "file:///path/to/resource"
```

### Prompts Operations

```bash
# List available prompts
npx @modelcontextprotocol/inspector --cli node build/index.js --method prompts/list

# Get a specific prompt
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method prompts/get \
  --prompt-name myprompt \
  --prompt-arg key=value
```

### Remote Server Testing

```bash
# Connect to remote MCP server (default SSE transport)
npx @modelcontextprotocol/inspector --cli https://my-mcp-server.example.com

# Connect with Streamable HTTP transport
npx @modelcontextprotocol/inspector --cli https://my-mcp-server.example.com \
  --transport http --method tools/list

# Connect with custom headers
npx @modelcontextprotocol/inspector --cli https://my-mcp-server.example.com \
  --transport http --method tools/list --header "X-API-Key: your-api-key"

# Call a tool on remote server
npx @modelcontextprotocol/inspector --cli https://my-mcp-server.example.com \
  --method tools/call --tool-name remotetool --tool-arg param=value
```

## UI Mode vs CLI Mode

### When to Use UI Mode

| Use Case | Benefits |
|----------|----------|
| **Server Development** | Visual interface for interactive testing and debugging |
| **Resource Exploration** | Interactive browser with hierarchical navigation and JSON visualization |
| **Tool Testing** | Form-based parameter input with real-time response visualization |
| **Prompt Engineering** | Interactive sampling with streaming responses and visual comparison |
| **Debugging** | Request history, visualized errors, and real-time notifications |
| **Learning MCP** | Rich visual interface helps new users understand server capabilities |

### When to Use CLI Mode

| Use Case | Benefits |
|----------|----------|
| **Server Development** | Scriptable commands for quick testing and CI; feedback loops with AI coding assistants |
| **Resource Exploration** | Programmatic listing and reading for automation and scripting |
| **Tool Testing** | Command-line tool execution with JSON output for scripting |
| **Prompt Engineering** | Batch processing of prompts with machine-readable output |
| **Debugging** | Direct JSON output for log analysis and integration with other tools |
| **Automation** | Ideal for CI/CD pipelines, batch processing, and integration with coding assistants |
| **Learning MCP** | Simplified commands for focused learning of specific endpoints |

## Authentication for MCP Servers

The inspector supports bearer token authentication for SSE connections:

1. Enter your token in the UI when connecting to an MCP server
2. Token is sent in the Authorization header
3. Override header name using the input field in the sidebar

## Development Mode

If working on the inspector itself:

```bash
# Development mode
npm run dev

# Co-develop with typescript-sdk
npm run dev:sdk "cd sdk && npm run examples:simple-server:w"

# Windows users
npm run dev:windows

# Production mode
npm run build
npm start
```

## Related Documentation

- [Inspector section of MCP docs](https://modelcontextprotocol.io/docs/tools/inspector)
- [Debugging guide](https://modelcontextprotocol.io/docs/tools/debugging)
- [Model Context Protocol documentation](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/modelcontextprotocol/inspector)

## Security Considerations

1. **Authentication Required**: Always use the generated session token
2. **Local Binding**: Default localhost binding prevents network access
3. **DNS Rebinding Protection**: Origin header validation prevents attacks
4. **Process Execution**: Proxy can spawn local processes - don't expose to untrusted networks
5. **Network Access**: Can connect to any specified MCP server

## Important Notes

1. **Node.js Version**: Requires Node.js ^22.7.5
2. **Security First**: Authentication is enabled by default for security
3. **Automatic Browser**: Opens browser automatically with pre-filled token
4. **Transport Support**: Supports stdio, SSE, and Streamable HTTP transports
5. **Configuration Export**: Easy export of server configurations for clients

## License

MIT License - see the [LICENSE](https://github.com/modelcontextprotocol/inspector/blob/HEAD/LICENSE) file for details.
