// System Update Command

import { Command } from 'commander';
import chalk from 'chalk';
import { LinuxOSMCPServer } from '../../../core/dist/index.js';

const mcpServer = new LinuxOSMCPServer();

export class UpdateCommand {
  getCommand(): Command {
    return new Command('update')
      .description('Update system packages')
      .option('--no-dry-run', 'actually perform updates (default is dry-run)')
      .option('--upgrade', 'upgrade packages to latest versions')
      .option('--security-only', 'only install security updates (where supported)')
      .option('--skip-package-list', 'skip updating package manager lists')
      .action(async (options) => {
        await this.executeUpdate(options);
      });
  }

  private async executeUpdate(options: any) {
    try {
      console.log(chalk.cyan.bold(`📦 System Update`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log('');

      const dryRun = options.dryRun !== false; // Default to true, only false if --no-dry-run
      const updatePackageList = !options.skipPackageList;
      const upgradePackages = options.upgrade;
      const securityOnly = options.securityOnly;

      if (dryRun) {
        console.log(chalk.yellow('⚠️  DRY RUN MODE - No actual updates will be performed'));
        console.log(chalk.gray('Use --no-dry-run to perform actual updates'));
        console.log('');
      } else {
        console.log(chalk.red('⚠️  LIVE MODE - System packages will be updated!'));
        console.log('');
      }

      console.log(chalk.yellow(`Update package lists: ${updatePackageList ? 'Yes' : 'No'}`));
      console.log(chalk.yellow(`Upgrade packages: ${upgradePackages ? 'Yes' : 'No'}`));
      if (upgradePackages) {
        console.log(chalk.yellow(`Security only: ${securityOnly ? 'Yes' : 'No'}`));
      }
      console.log('');

      // Show what will be done
      if (!upgradePackages && !updatePackageList) {
        console.log(chalk.yellow('ℹ️  No actions selected. Use --upgrade to upgrade packages.'));
        return;
      }

      if (upgradePackages && !dryRun) {
        console.log(chalk.yellow('⚠️  This will upgrade system packages. Continue? (This is simulated for now)'));
        console.log('');
      }

      const result = await mcpServer.executeTool('update_system', {
        updatePackageList,
        upgradePackages,
        securityOnly,
        dryRun
      });

      if (result.success) {
        console.log(chalk.green(`✅ System update completed successfully`));
        console.log('');
        
        console.log(chalk.yellow(`Package Manager: ${result.packageManager}`));
        console.log(chalk.yellow(`Commands to execute: ${result.commands.length}`));
        console.log('');

        if (result.commands && result.commands.length > 0) {
          console.log(chalk.gray('Commands:'));
          result.commands.forEach((cmd: string, index: number) => {
            console.log(chalk.gray(`  ${index + 1}. ${cmd}`));
          });
          console.log('');
        }

        if (result.results && result.results.length > 0) {
          console.log(chalk.gray('Results:'));
          result.results.forEach((res: any, index: number) => {
            const status = res.success ? chalk.green('✅') : chalk.red('❌');
            console.log(`  ${status} Command ${index + 1}: ${res.success ? 'Success' : 'Failed'}`);
            if (res.stdout) {
              console.log(chalk.gray(`     Output: ${res.stdout.substring(0, 100)}${res.stdout.length > 100 ? '...' : ''}`));
            }
          });
        }

        if (dryRun) {
          console.log('');
          console.log(chalk.cyan('💡 To perform actual updates, run with --no-dry-run'));
        }
      } else {
        console.log(chalk.red(`❌ System update failed`));
        if (result.error) {
          console.log(chalk.red('Error:'));
          console.log(result.error);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ System update failed:'), errorMessage);
      process.exit(1);
    }
  }
} 