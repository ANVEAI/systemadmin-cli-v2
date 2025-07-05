// File Cleanup Command

import { Command } from 'commander';
import chalk from 'chalk';
import { LinuxOSMCPServer } from '../../../core/dist/index.js';

const mcpServer = new LinuxOSMCPServer();

export class CleanupCommand {
  getCommand(): Command {
    return new Command('cleanup')
      .description('Clean up files and directories safely')
      .argument('<target>', 'target directory or file to clean up')
      .option('-r, --recursive', 'process directories recursively')
      .option('--no-dry-run', 'actually perform cleanup (default is dry-run)')
      .option('--extensions <ext...>', 'file extensions to target (e.g., tmp log)')
      .option('--age <days>', 'only process files older than this many days', parseInt)
      .option('--size <size>', 'only process files larger than this size (e.g., 1MB)')
      .action(async (target, options) => {
        await this.executeCleanup(target, options);
      });
  }

  private async executeCleanup(target: string, options: any) {
    try {
      console.log(chalk.cyan.bold(`🧹 File Cleanup`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log('');

      const dryRun = options.dryRun !== false; // Default to true, only false if --no-dry-run
      
      if (dryRun) {
        console.log(chalk.yellow('⚠️  DRY RUN MODE - No files will actually be deleted'));
        console.log(chalk.gray('Use --no-dry-run to perform actual cleanup'));
        console.log('');
      } else {
        console.log(chalk.red('⚠️  LIVE MODE - Files will be permanently deleted!'));
        console.log('');
      }

      // Prepare filters
      const filters: any = {};
      if (options.extensions) {
        filters.extensions = Array.isArray(options.extensions) 
          ? options.extensions 
          : [options.extensions];
      }
      if (options.age) {
        filters.ageInDays = options.age;
      }
      if (options.size) {
        filters.sizeLimit = options.size;
      }

      console.log(chalk.yellow(`Target: ${target}`));
      console.log(chalk.yellow(`Recursive: ${options.recursive ? 'Yes' : 'No'}`));
      if (filters.extensions) {
        console.log(chalk.yellow(`Extensions: ${filters.extensions.join(', ')}`));
      }
      if (filters.ageInDays) {
        console.log(chalk.yellow(`Age filter: Older than ${filters.ageInDays} days`));
      }
      if (filters.sizeLimit) {
        console.log(chalk.yellow(`Size filter: Larger than ${filters.sizeLimit}`));
      }
      console.log('');

      const result = await mcpServer.executeTool('cleanup_files', {
        target,
        recursive: options.recursive,
        dryRun,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });

      if (result.success) {
        console.log(chalk.green(`✅ Cleanup completed successfully`));
        console.log('');
        console.log(chalk.yellow(`Files processed: ${result.filesProcessed}`));
        console.log(chalk.yellow(`Total size: ${result.totalSize}`));
        console.log('');
        
        if (result.details && result.details.length > 0) {
          console.log(chalk.gray('Details:'));
          result.details.forEach((detail: string) => {
            console.log(chalk.gray(`  • ${detail}`));
          });
        }

        if (result.errors && result.errors.length > 0) {
          console.log('');
          console.log(chalk.red('Errors:'));
          result.errors.forEach((error: string) => {
            console.log(chalk.red(`  • ${error}`));
          });
        }
      } else {
        console.log(chalk.red(`❌ Cleanup failed`));
        if (result.error) {
          console.log(chalk.red('Error:'));
          console.log(result.error);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Cleanup failed:'), errorMessage);
      process.exit(1);
    }
  }
} 