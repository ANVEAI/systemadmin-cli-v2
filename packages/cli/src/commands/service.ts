// Service Management Command

import { Command } from 'commander';
import chalk from 'chalk';
import { LinuxOSMCPServer } from '../../../core/dist/index.js';

const mcpServer = new LinuxOSMCPServer();

export class ServiceCommand {
  getCommand(): Command {
    return new Command('service')
      .description('Manage system services')
      .addCommand(this.createStatusCommand())
      .addCommand(this.createStartCommand())
      .addCommand(this.createStopCommand())
      .addCommand(this.createRestartCommand())
      .addCommand(this.createEnableCommand())
      .addCommand(this.createDisableCommand());
  }

  private createStatusCommand(): Command {
    return new Command('status')
      .description('Check service status')
      .argument('<service>', 'service name')
      .action(async (service) => {
        await this.executeServiceAction(service, 'status');
      });
  }

  private createStartCommand(): Command {
    return new Command('start')
      .description('Start a service')
      .argument('<service>', 'service name')
      .action(async (service) => {
        console.log(chalk.yellow(`⚠️  Starting service: ${service}`));
        await this.executeServiceAction(service, 'start');
      });
  }

  private createStopCommand(): Command {
    return new Command('stop')
      .description('Stop a service')
      .argument('<service>', 'service name')
      .action(async (service) => {
        console.log(chalk.yellow(`⚠️  Stopping service: ${service}`));
        await this.executeServiceAction(service, 'stop');
      });
  }

  private createRestartCommand(): Command {
    return new Command('restart')
      .description('Restart a service')
      .argument('<service>', 'service name')
      .action(async (service) => {
        console.log(chalk.yellow(`⚠️  Restarting service: ${service}`));
        await this.executeServiceAction(service, 'restart');
      });
  }

  private createEnableCommand(): Command {
    return new Command('enable')
      .description('Enable a service to start on boot')
      .argument('<service>', 'service name')
      .action(async (service) => {
        console.log(chalk.yellow(`⚠️  Enabling service: ${service}`));
        await this.executeServiceAction(service, 'enable');
      });
  }

  private createDisableCommand(): Command {
    return new Command('disable')
      .description('Disable a service from starting on boot')
      .argument('<service>', 'service name')
      .action(async (service) => {
        console.log(chalk.yellow(`⚠️  Disabling service: ${service}`));
        await this.executeServiceAction(service, 'disable');
      });
  }

  private async executeServiceAction(service: string, action: string) {
    try {
      console.log(chalk.cyan.bold(`🔧 Service Management`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log('');

      const result = await mcpServer.executeTool('manage_service', {
        service,
        action
      });

      if (result.success) {
        console.log(chalk.green(`✅ Service ${action} completed successfully`));
        console.log('');
        console.log(chalk.yellow(`Service: ${result.service}`));
        console.log(chalk.yellow(`Action: ${result.action}`));
        console.log('');
        
        if (result.result && result.result.stdout) {
          console.log(chalk.gray('Output:'));
          console.log(result.result.stdout);
        }
      } else {
        console.log(chalk.red(`❌ Service ${action} failed`));
        if (result.result && result.result.stderr) {
          console.log(chalk.red('Error:'));
          console.log(result.result.stderr);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Service management failed:'), errorMessage);
      process.exit(1);
    }
  }
} 