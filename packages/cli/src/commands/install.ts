// Package Installation Command

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { linuxOSMCPServer, validatePackageName } from '../../../core/dist/index.js';

export class InstallCommand {
  getCommand(): Command {
    return new Command('install')
      .description('Install system packages and software')
      .argument('[packages...]', 'packages to install')
      .option('-y, --yes', 'skip confirmation prompts')
      .option('--update-first', 'update package lists before installation')
      .option('--dry-run', 'show what would be installed without actually installing')
      .action(async (packages: string[], options) => {
        try {
          await this.handleInstall(packages, options);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(chalk.red('❌ Installation failed:'), errorMessage);
          process.exit(1);
        }
      });
  }

  private async handleInstall(packages: string[], options: any) {
    // Validate input
    if (!packages || packages.length === 0) {
      console.log(chalk.yellow('⚠️  No packages specified'));
      
      const { packageInput } = await inquirer.prompt([{
        type: 'input',
        name: 'packageInput',
        message: 'Enter packages to install (space-separated):',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Please enter at least one package name';
          }
          return true;
        }
      }]);
      
      packages = packageInput.trim().split(/\s+/);
    }

    // Validate package names
    const invalidPackages = packages.filter(pkg => !validatePackageName(pkg));
    if (invalidPackages.length > 0) {
      console.error(chalk.red('❌ Invalid package names:'), invalidPackages.join(', '));
      process.exit(1);
    }

    // Show installation plan
    console.log('');
    console.log(chalk.cyan.bold('📦 Installation Plan'));
    console.log(chalk.gray('─'.repeat(50)));
    
    packages.forEach(pkg => {
      console.log(chalk.green(`  + ${pkg}`));
    });
    
    if (options.updateFirst) {
      console.log(chalk.yellow('  • Update package lists first'));
    }
    
    console.log('');

    // Dry run mode
    if (options.dryRun) {
      console.log(chalk.blue('🔍 Dry run mode - no packages will be installed'));
      console.log(chalk.gray('Remove --dry-run flag to perform actual installation'));
      return;
    }

    // Confirmation prompt (unless --yes flag is used)
    if (!options.yes) {
      const { confirmed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmed',
        message: `Install ${packages.length} package(s)?`,
        default: false
      }]);

      if (!confirmed) {
        console.log(chalk.yellow('⚠️  Installation cancelled'));
        return;
      }
    }

    // Execute installation
    const spinner = ora({
      text: 'Installing packages...',
      color: 'cyan'
    }).start();

    try {
      const result = await linuxOSMCPServer.executeTool('install_package', {
        packages,
        updateFirst: options.updateFirst
      });

      if (result.success) {
        spinner.succeed(chalk.green(`✅ Successfully installed ${packages.length} package(s)`));
        
        // Show installation summary
        console.log('');
        console.log(chalk.cyan.bold('📋 Installation Summary'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(`Packages: ${chalk.white(packages.join(', '))}`);
        console.log(`Package Manager: ${chalk.white(result.packageManager)}`);
        
        if (result.results && result.results.length > 0) {
          console.log('');
          console.log(chalk.yellow('Operation Details:'));
          result.results.forEach((opResult: any, index: number) => {
            const status = opResult.success ? chalk.green('✓') : chalk.red('✗');
            console.log(`  ${status} Step ${index + 1}: ${opResult.description || 'Package operation'}`);
          });
        }
      } else {
        spinner.fail(chalk.red('❌ Installation failed'));
        console.log('');
        
        if (result.results && result.results.length > 0) {
          console.log(chalk.yellow('Error Details:'));
          result.results.forEach((opResult: any, index: number) => {
            if (!opResult.success) {
              console.log(chalk.red(`  Step ${index + 1}: ${opResult.stderr || opResult.error || 'Unknown error'}`));
            }
          });
        }
        
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('❌ Installation failed'));
      throw error;
    }

    console.log('');
  }
} 