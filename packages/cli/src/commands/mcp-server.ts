// MCP Server Management Command

import { Command } from 'commander';
import chalk from 'chalk';
import { LinuxOSMCPServer } from '../../../core/dist/index.js';

// Create MCP server instance
const mcpServer = new LinuxOSMCPServer();

export class MCPServerCommand {
  getCommand(): Command {
    return new Command('mcp-server')
      .alias('mcp')
      .description('MCP server management')
      .addCommand(this.createStartCommand())
      .addCommand(this.createListToolsCommand())
      .addCommand(this.createTestCommand());
  }

  private createStartCommand(): Command {
    return new Command('start')
      .description('Start the MCP server')
      .option('-p, --port <port>', 'port number', '3000')
      .option('--stdio', 'use stdio transport (default)')
      .action(async (options) => {
        try {
          console.log(chalk.cyan.bold('🚀 Starting LinuxOS-AI MCP Server...'));
          console.log('');
          
          if (options.stdio) {
            console.log(chalk.yellow('📡 Using stdio transport'));
            console.log(chalk.gray('Server will communicate via stdin/stdout'));
          } else {
            console.log(chalk.yellow(`📡 HTTP server starting on port ${options.port}`));
          }
          
          console.log('');
          console.log(chalk.green('✅ MCP Server ready for connections'));
          console.log(chalk.gray('Press Ctrl+C to stop the server'));
          
          // For now, just show the available tools
          await this.showAvailableTools();
          
          // Keep the process running
          process.stdin.resume();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(chalk.red('❌ Failed to start MCP server:'), errorMessage);
          process.exit(1);
        }
      });
  }

  private createListToolsCommand(): Command {
    return new Command('list-tools')
      .alias('tools')
      .description('List available MCP tools')
      .option('--json', 'output as JSON')
      .action(async (options) => {
        try {
          const tools = await mcpServer.getTools();
          
          if (options.json) {
            console.log(JSON.stringify(tools, null, 2));
            return;
          }
          
          await this.showAvailableTools();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(chalk.red('❌ Failed to list tools:'), errorMessage);
          process.exit(1);
        }
      });
  }

  private createTestCommand(): Command {
    return new Command('test')
      .description('Test MCP server functionality')
      .argument('[tool]', 'specific tool to test')
      .action(async (tool?: string) => {
        try {
          console.log(chalk.cyan.bold('🧪 Testing MCP Server...'));
          console.log('');
          
          if (tool) {
            await this.testSpecificTool(tool);
          } else {
            await this.testAllTools();
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(chalk.red('❌ Test failed:'), errorMessage);
          process.exit(1);
        }
      });
  }

  private async showAvailableTools() {
    const tools = await mcpServer.getTools();
    
    console.log(chalk.cyan.bold('🛠️  Available MCP Tools'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log('');
    
    tools.forEach((tool: any, index: number) => {
      console.log(chalk.yellow(`${index + 1}. ${tool.name}`));
      console.log(chalk.gray(`   ${tool.description}`));
      
      // Show schema summary
      if (tool.inputSchema && typeof tool.inputSchema === 'object') {
        const schema = tool.inputSchema as any;
        if (schema.properties) {
          const requiredProps = schema.required || [];
          const props = Object.keys(schema.properties);
          console.log(chalk.gray(`   Parameters: ${props.join(', ')}`));
          if (requiredProps.length > 0) {
            console.log(chalk.gray(`   Required: ${requiredProps.join(', ')}`));
          }
        }
      }
      
      console.log('');
    });
    
    console.log(chalk.green(`Total: ${tools.length} tools available`));
  }

  private async testSpecificTool(toolName: string) {
    console.log(chalk.yellow(`Testing tool: ${toolName}`));
    console.log('');
    
    const tools = await mcpServer.getTools();
    const tool = tools.find((t: any) => t.name === toolName);
    
    if (!tool) {
      console.error(chalk.red(`❌ Tool '${toolName}' not found`));
      console.log('');
      console.log(chalk.gray('Available tools:'));
      tools.forEach((t: any) => console.log(chalk.gray(`  - ${t.name}`)));
      return;
    }
    
    // Test with safe default parameters
    let testParams = {};
    
    switch (toolName) {
      case 'system_info':
        testParams = {};
        break;
      case 'execute_command':
        testParams = { command: 'echo', args: ['Hello from LinuxOS-AI'] };
        break;
      case 'manage_processes':
        testParams = { action: 'list' };
        break;
      case 'cleanup_files':
        testParams = { target: '/tmp', dryRun: true };
        break;
      case 'update_system':
        testParams = { dryRun: true, updatePackageList: false };
        break;
      case 'manage_service':
        testParams = { service: 'ssh', action: 'status' };
        break;
      case 'install_package':
        console.log(chalk.yellow('⚠️  Skipping install_package test (requires confirmation)'));
        return;
      case 'remove_package':
        console.log(chalk.yellow('⚠️  Skipping remove_package test (requires confirmation)'));
        return;
      default:
        console.log(chalk.yellow(`⚠️  No test case defined for ${toolName}`));
        return;
    }
    
    try {
      const result = await mcpServer.executeTool(toolName, testParams);
      console.log(chalk.green(`✅ Tool '${toolName}' executed successfully`));
      console.log(chalk.gray('Result:'));
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`❌ Tool '${toolName}' failed: ${errorMessage}`));
    }
  }

  private async testAllTools() {
    const tools = await mcpServer.getTools();
    
    console.log(chalk.yellow(`Testing ${tools.length} tools...`));
    console.log('');
    
    for (const tool of tools) {
      if (['install_package', 'remove_package'].includes((tool as any).name)) {
        console.log(chalk.gray(`⏭️  Skipping ${(tool as any).name} (requires confirmation)`));
        continue;
      }
      
      console.log(chalk.blue(`Testing ${(tool as any).name}...`));
      await this.testSpecificTool((tool as any).name);
      console.log('');
    }
    
    console.log(chalk.green('✅ All tests completed'));
  }
} 