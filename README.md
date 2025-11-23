# MCPCalculatorSample

## Introduction

This project is a sample implementation of an MCP (Model Context Protocol) server based on the TypeScript SDK QuickStart. It provides a calculator tool that can add two numbers and a greeting resource for dynamic greetings.

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Install Dependencies
```bash
npm install
```

## Quick Deployment

Follow these steps to build and run the MCP server compatible with the VS Code Cline agent plugin:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

The server will run locally and can be configured in VS Code to connect with the Cline agent.

## Sample Usage

Once the MCP server is running and configured in Cline, you can interact with it through the following capabilities:

### Calculator Tool
The server provides an `add` tool for adding two numbers:

**Example:** Add 5 and 3:
```
Result: 8
```

### Greeting Resources
Access dynamic greeting resources with URLs like `greeting://{name}`:

**Example:** Access `greeting://World`:
```
Hello, World!
```

## MCP Server Configuration in Cline

The MCP server will appear in Cline under the name **`mcp-calculator-sample`**.

To configure the server in VS Code for use with the Cline agent plugin, add the following to your `settings.json`:

```json
{
  "cline.mcpServers": {
    "mcp-calculator-sample": {
      "command": "node",
      "args": ["/path/to/your/project/build/server.js"]
    }
  }
}
```

Replace `/path/to/your/project` with the actual absolute path to this project directory. After adding this configuration and restarting VS Code, the calculator tools and resources will be available in Cline interactions.
