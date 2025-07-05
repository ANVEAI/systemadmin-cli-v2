// System Information Command

import { Command } from 'commander';
import chalk from 'chalk';
import { systemDetector, formatBytes } from '../../../core/dist/index.js';

export class SystemInfoCommand {
  getCommand(): Command {
    return new Command('system')
      .description('System information and diagnostics')
      .addCommand(this.createInfoCommand())
      .addCommand(this.createResourcesCommand());
  }

  private createInfoCommand(): Command {
    return new Command('info')
      .description('Display comprehensive system information')
      .option('--json', 'output as JSON')
      .action(async (options) => {
        try {
          const systemInfo = await systemDetector.getSystemInfo();
          
          if (options.json) {
            console.log(JSON.stringify(systemInfo, null, 2));
            return;
          }

          console.log('');
          console.log(chalk.cyan.bold('🐧 System Information'));
          console.log(chalk.gray('─'.repeat(50)));
          
          console.log(chalk.yellow('Operating System:'));
          console.log(`  Platform: ${chalk.white(systemInfo.os)}`);
          console.log(`  Distribution: ${chalk.white(systemInfo.distro)}`);
          console.log(`  Kernel: ${chalk.white(systemInfo.kernel)}`);
          console.log(`  Architecture: ${chalk.white(systemInfo.arch)}`);
          
          console.log('');
          console.log(chalk.yellow('Package Manager:'));
          console.log(`  Name: ${chalk.white(systemInfo.packageManager.name)}`);
          console.log(`  Install: ${chalk.gray(systemInfo.packageManager.installCmd)}`);
          console.log(`  Remove: ${chalk.gray(systemInfo.packageManager.removeCmd)}`);
          console.log(`  Update: ${chalk.gray(systemInfo.packageManager.updateCmd)}`);
          
          console.log('');
          console.log(chalk.yellow('User Information:'));
          console.log(`  User: ${chalk.white(systemInfo.user)}`);
          console.log(`  Shell: ${chalk.white(systemInfo.shell)}`);
          console.log(`  Root Access: ${systemInfo.isRoot ? chalk.green('Yes') : chalk.red('No')}`);
          
          console.log('');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(chalk.red('❌ Failed to get system information:'), errorMessage);
          process.exit(1);
        }
      });
  }

  private createResourcesCommand(): Command {
    return new Command('resources')
      .description('Display system resource usage')
      .option('--json', 'output as JSON')
      .action(async (options) => {
        try {
          const resources = await systemDetector.getSystemResources();
          
          if (options.json) {
            console.log(JSON.stringify(resources, null, 2));
            return;
          }

          console.log('');
          console.log(chalk.cyan.bold('💻 System Resources'));
          console.log(chalk.gray('─'.repeat(50)));
          
          console.log(chalk.yellow('Memory:'));
          console.log(`  Total: ${chalk.white(formatBytes(resources.memory.total))}`);
          console.log(`  Used: ${chalk.white(formatBytes(resources.memory.used))}`);
          console.log(`  Free: ${chalk.white(formatBytes(resources.memory.free))}`);
          
          const memoryUsagePercent = Math.round((resources.memory.used / resources.memory.total) * 100);
          const memoryColor = memoryUsagePercent > 80 ? chalk.red : memoryUsagePercent > 60 ? chalk.yellow : chalk.green;
          console.log(`  Usage: ${memoryColor(`${memoryUsagePercent}%`)}`);
          
          console.log('');
          console.log(chalk.yellow('CPU:'));
          console.log(`  Cores: ${chalk.white(resources.cpu.count)}`);
          console.log(`  Load Average: ${chalk.white(resources.cpu.load.map(l => l.toFixed(2)).join(', '))}`);
          
          if (resources.disk.total > 0) {
            console.log('');
            console.log(chalk.yellow('Disk (Root):'));
            console.log(`  Total: ${chalk.white(formatBytes(resources.disk.total))}`);
            console.log(`  Used: ${chalk.white(formatBytes(resources.disk.used))}`);
            console.log(`  Free: ${chalk.white(formatBytes(resources.disk.free))}`);
            
            const diskUsagePercent = Math.round((resources.disk.used / resources.disk.total) * 100);
            const diskColor = diskUsagePercent > 90 ? chalk.red : diskUsagePercent > 75 ? chalk.yellow : chalk.green;
            console.log(`  Usage: ${diskColor(`${diskUsagePercent}%`)}`);
          }
          
          console.log('');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(chalk.red('❌ Failed to get system resources:'), errorMessage);
          process.exit(1);
        }
      });
  }
} 