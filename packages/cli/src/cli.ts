#!/usr/bin/env node
// SystemAdmin-CLI v2 - Advanced System Administration Toolkit

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { VERSION, systemDetector } from '../../core/dist/index.js';
import { SystemInfoCommand } from './commands/system-info.js';
import { InstallCommand } from './commands/install.js';
import { MCPServerCommand } from './commands/mcp-server.js';
import { ServiceCommand } from './commands/service.js';
import { CleanupCommand } from './commands/cleanup.js';
import { ProcessCommand } from './commands/process.js';
import { UpdateCommand } from './commands/update.js';

const program = new Command();

// Configure the main program
program
  .name('sysadmin-cli')
  .description('Advanced system administration toolkit with safety-first approach')
  .version(VERSION)
  .option('-v, --verbose', 'enable verbose output')
  .option('--debug', 'enable debug mode')
  .hook('preAction', async (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) {
      process.env.DEBUG = 'true';
    }
  });

// Add commands
program.addCommand(new SystemInfoCommand().getCommand());
program.addCommand(new InstallCommand().getCommand());
program.addCommand(new MCPServerCommand().getCommand());

// Advanced System Administration Commands
program.addCommand(new ServiceCommand().getCommand());
program.addCommand(new CleanupCommand().getCommand());
program.addCommand(new ProcessCommand().getCommand());
program.addCommand(new UpdateCommand().getCommand());

// Custom help display
program.on('--help', () => {
  console.log('');
  console.log(boxen(
    chalk.cyan.bold('🔧 SystemAdmin-CLI v2') + '\n\n' +
    chalk.white('Advanced system administration toolkit') + '\n' +
    chalk.gray('Safety-first approach with intelligent automation'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
  
  console.log('');
  console.log(chalk.yellow('Examples:'));
  console.log(chalk.gray('  sysadmin-cli system info                 # Get system information'));
  console.log(chalk.gray('  sysadmin-cli install docker              # Install Docker'));
  console.log(chalk.gray('  sysadmin-cli service status nginx        # Check nginx status'));
  console.log(chalk.gray('  sysadmin-cli cleanup /tmp --extensions tmp log # Clean temp files'));
  console.log(chalk.gray('  sysadmin-cli process list                # List processes'));
  console.log(chalk.gray('  sysadmin-cli update --upgrade             # Update system packages'));
  console.log(chalk.gray('  sysadmin-cli mcp-server start            # Start MCP server'));
  console.log('');
  
  console.log(chalk.blue('Key Features:'));
  console.log(chalk.gray('  • Safety-first validation before destructive operations'));
  console.log(chalk.gray('  • Cross-platform support (Linux/macOS)'));
  console.log(chalk.gray('  • Dry-run mode for testing changes'));
  console.log(chalk.gray('  • Comprehensive system administration tools'));
  console.log(chalk.gray('  • MCP server integration for extensibility'));
  console.log('');
});

// Error handling
program.exitOverride();

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Operation cancelled by user'));
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Unexpected error:'), error.message);
  if (process.env.DEBUG === 'true') {
    console.error(error.stack);
  }
  process.exit(1);
});

// Main execution
async function main() {
  try {
    // Show welcome message on first run
    if (process.argv.length === 2) {
      await showWelcome();
    }
    
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'commander.helpDisplayed') {
      return;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red('❌ Error:'), errorMessage);
    if (process.env.DEBUG === 'true' && error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function showWelcome() {
  console.log(boxen(
    chalk.cyan.bold('🔧 Welcome to SystemAdmin-CLI v2!') + '\n\n' +
    chalk.white('Advanced system administration toolkit') + '\n' +
    chalk.gray('Type --help to see available commands'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));

  try {
    const systemInfo = await systemDetector.getSystemInfo();
    console.log('');
    console.log(chalk.green('✅ System detected:'));
    console.log(chalk.gray(`   OS: ${systemInfo.os} (${systemInfo.distro})`));
    console.log(chalk.gray(`   Package Manager: ${systemInfo.packageManager.name}`));
    console.log(chalk.gray(`   User: ${systemInfo.user}${systemInfo.isRoot ? ' (root)' : ''}`));
    console.log('');
    console.log(chalk.blue('📚 Quick Start:'));
    console.log(chalk.gray('   sysadmin-cli system info     # View detailed system information'));
    console.log(chalk.gray('   sysadmin-cli --help          # Show all available commands'));
    console.log('');
  } catch (error) {
    console.log(chalk.yellow('⚠️  System detection failed, some features may be limited'));
  }
}

// For ES modules, check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 