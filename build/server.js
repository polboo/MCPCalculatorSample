"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
class CalculatorServer {
    server;
    constructor() {
        this.server = new index_js_1.Server({
            name: 'demo-server',
            version: '1.0.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupResourceHandlers();
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupResourceHandlers() {
        // Dynamic greeting resource template
        this.server.setRequestHandler(types_js_1.ListResourceTemplatesRequestSchema, async () => ({
            resourceTemplates: [
                {
                    uriTemplate: 'greeting://{name}',
                    name: 'Greeting Resource',
                    description: 'Dynamic greeting generator',
                    mimeType: 'text/plain',
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            const match = request.params.uri.match(/^greeting:\/\/(.+)$/);
            if (!match) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, `Invalid URI format: ${request.params.uri}`);
            }
            const name = decodeURIComponent(match[1]);
            return {
                contents: [
                    {
                        uri: request.params.uri,
                        text: `Hello, ${name}!`,
                    },
                ],
            };
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'add',
                    description: 'Add two numbers',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            a: { type: 'number', description: 'First number' },
                            b: { type: 'number', description: 'Second number' },
                        },
                        required: ['a', 'b'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'add') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            const args = request.params.arguments;
            if (typeof args?.a !== 'number' || typeof args?.b !== 'number') {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid parameters for add tool');
            }
            const result = args.a + args.b;
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ result }, null, 2),
                    },
                ],
            };
        });
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('Calculator MCP server running on stdio');
    }
}
const server = new CalculatorServer();
server.run().catch(console.error);
