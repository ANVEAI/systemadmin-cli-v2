// Process Management Command

import { Command } from 'commander';
import chalk from 'chalk';
import { LinuxOSMCPServer } from '../../../core/dist/index.js';

const mcpServer = new LinuxOSMCPServer();

export class ProcessCommand {
  getCommand(): Command {
    return new Command('process')
      .alias('ps')
      .description('Manage system processes')
      .addCommand(this.createListCommand())
      .addCommand(this.createInfoCommand())
      .addCommand(this.createKillCommand());
  }

  private createListCommand(): Command {
    return new Command('list')
      .alias('ls')
      .description('List running processes')
      .option('-n, --name <name>', 'filter by process name')
      .action(async (options) => {
        await this.executeProcessAction('list', { name: options.name });
      });
  }

  private createInfoCommand(): Command {
    return new Command('info')
      .description('Get detailed information about a process')
      .argument('<pid>', 'process ID', parseInt)
      .action(async (pid) => {
        await this.executeProcessAction('info', { pid });
      });
  }

  private createKillCommand(): Command {
    return new Command('kill')
      .description('Terminate a process')
      .argument('<target>', 'process ID (number) or process name (string)')
      .option('-s, --signal <signal>', 'signal to send', 'TERM')
      .option('-f, --force', 'use KILL signal (equivalent to -s KILL)')
      .action(async (target, options) => {
        const signal = options.force ? 'KILL' : options.signal;
        const isNumeric = /^\d+$/.test(target);
        
        console.log(chalk.yellow(`⚠️  Killing process: ${target} with signal ${signal}`));
        
        await this.executeProcessAction('kill', {
          pid: isNumeric ? parseInt(target) : undefined,
          name: isNumeric ? undefined : target,
          signal
        });
      });
  }

  private async executeProcessAction(action: string, params: any = {}) {
    try {
      console.log(chalk.cyan.bold(`⚙️  Process Management`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log('');

      const result = await mcpServer.executeTool('manage_processes', {
        action,
        ...params
      });

      if (result.success) {
        console.log(chalk.green(`✅ Process ${action} completed successfully`));
        console.log('');
        
        // Display action-specific information
        if (action === 'list') {
          console.log(chalk.yellow(`Action: List processes${params.name ? ` (filtered by: ${params.name})` : ''}`));
        } else if (action === 'info') {
          console.log(chalk.yellow(`Process ID: ${params.pid}`));
        } else if (action === 'kill') {
          console.log(chalk.yellow(`Target: ${params.pid ? `PID ${params.pid}` : `Name ${params.name}`}`));
          console.log(chalk.yellow(`Signal: ${params.signal}`));
        }
        
        console.log('');
        
        if (result.result && result.result.stdout) {
          console.log(chalk.gray('Output:'));
          console.log(result.result.stdout);
        }

        if (action === 'kill' && result.success) {
          console.log(chalk.green('Process terminated successfully'));
        }
      } else {
        console.log(chalk.red(`❌ Process ${action} failed`));
        if (result.result && result.result.stderr) {
          console.log(chalk.red('Error:'));
          console.log(result.result.stderr);
        }
        if (result.error) {
          console.log(chalk.red('Error:'));
          console.log(result.error);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Process management failed:'), errorMessage);
      process.exit(1);
    }
  }
} 