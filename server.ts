import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class CalculatorServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'demo-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    resources: {},
                    tools: {},
                },
            }
        );

        this.setupResourceHandlers();
        this.setupToolHandlers();

        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupResourceHandlers() {
        // Dynamic greeting resource template
        this.server.setRequestHandler(
            ListResourceTemplatesRequestSchema,
            async () => ({
                resourceTemplates: [
                    {
                        uriTemplate: 'greeting://{name}',
                        name: 'Greeting Resource',
                        description: 'Dynamic greeting generator',
                        mimeType: 'text/plain',
                    },
                ],
            })
        );

        this.server.setRequestHandler(
            ReadResourceRequestSchema,
            async (request) => {
                const match = request.params.uri.match(/^greeting:\/\/(.+)$/);
                if (!match) {
                    throw new McpError(
                        ErrorCode.InvalidRequest,
                        `Invalid URI format: ${request.params.uri}`
                    );
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
            }
        );
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'add') {
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${request.params.name}`
                );
            }

            const args = request.params.arguments;
            if (typeof args?.a !== 'number' || typeof args?.b !== 'number') {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'Invalid parameters for add tool'
                );
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
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Calculator MCP server running on stdio');
    }
}

const server = new CalculatorServer();
server.run().catch(console.error);
