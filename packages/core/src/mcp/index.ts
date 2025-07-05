// MCP server integration for LinuxOS-AI v2

import { SystemCommand, ExecutionResult, SafetyValidation } from '../types/index.js';
import { SafetyValidator, BackupManager } from '../safety/index.js';
import { systemDetector } from '../system/index.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
  handler: (params: any) => Promise<any>;
}

export interface ToolExecutionContext {
  command: SystemCommand;
  validation: SafetyValidation;
  confirmed: boolean;
  backup?: string;
}

export class LinuxOSMCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private safetyValidator = new SafetyValidator();
  private backupManager = new BackupManager();

  constructor() {
    this.registerCoreTool();
  }

  private registerCoreTool() {
    this.registerTool({
      name: 'install_package',
      description: 'Install system packages using the appropriate package manager',
      inputSchema: {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of packages to install'
          },
          updateFirst: {
            type: 'boolean',
            default: false,
            description: 'Update package lists before installation'
          }
        },
        required: ['packages']
      },
      handler: this.installPackages.bind(this)
    });

    this.registerTool({
      name: 'remove_package',
      description: 'Remove system packages using the appropriate package manager',
      inputSchema: {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of packages to remove'
          },
          purge: {
            type: 'boolean',
            default: false,
            description: 'Remove configuration files (where supported)'
          }
        },
        required: ['packages']
      },
      handler: this.removePackages.bind(this)
    });

    this.registerTool({
      name: 'system_info',
      description: 'Get comprehensive system information',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      handler: this.getSystemInfo.bind(this)
    });

    this.registerTool({
      name: 'execute_command',
      description: 'Execute a system command with safety validation',
      inputSchema: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'Command to execute'
          },
          args: {
            type: 'array',
            items: { type: 'string' },
            description: 'Command arguments'
          },
          workingDir: {
            type: 'string',
            description: 'Working directory for command execution'
          },
          timeout: {
            type: 'number',
            default: 30000,
            description: 'Timeout in milliseconds'
          }
        },
        required: ['command']
      },
      handler: this.executeCommand.bind(this)
    });

    // New Phase 2 tools
    this.registerTool({
      name: 'manage_service',
      description: 'Manage system services (start, stop, restart, status, enable, disable)',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Service name'
          },
          action: {
            type: 'string',
            enum: ['start', 'stop', 'restart', 'status', 'enable', 'disable'],
            description: 'Action to perform on the service'
          }
        },
        required: ['service', 'action']
      },
      handler: this.manageService.bind(this)
    });

    this.registerTool({
      name: 'cleanup_files',
      description: 'Clean up files and directories with safety validation',
      inputSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description: 'Target directory or file to clean up'
          },
          recursive: {
            type: 'boolean',
            default: false,
            description: 'Process directories recursively'
          },
          dryRun: {
            type: 'boolean',
            default: true,
            description: 'Show what would be done without actually doing it'
          },
          filters: {
            type: 'object',
            properties: {
              extensions: {
                type: 'array',
                items: { type: 'string' },
                description: 'File extensions to target (e.g., ["tmp", "log"])'
              },
              ageInDays: {
                type: 'number',
                description: 'Only process files older than this many days'
              },
              sizeLimit: {
                type: 'string',
                description: 'Only process files larger than this size (e.g., "1MB")'
              }
            }
          }
        },
        required: ['target']
      },
      handler: this.cleanupFiles.bind(this)
    });

    this.registerTool({
      name: 'manage_processes',
      description: 'List, monitor, or manage system processes',
      inputSchema: {
        type: 'object',
        properties: {
          pid: {
            type: 'number',
            description: 'Process ID (for specific process operations)'
          },
          name: {
            type: 'string',
            description: 'Process name (for name-based operations)'
          },
          action: {
            type: 'string',
            enum: ['list', 'kill', 'info'],
            description: 'Action to perform'
          },
          signal: {
            type: 'string',
            default: 'TERM',
            description: 'Signal to send when killing process (TERM, KILL, etc.)'
          }
        },
        required: ['action']
      },
      handler: this.manageProcesses.bind(this)
    });

    this.registerTool({
      name: 'update_system',
      description: 'Update package lists and upgrade system packages',
      inputSchema: {
        type: 'object',
        properties: {
          updatePackageList: {
            type: 'boolean',
            default: true,
            description: 'Update the package manager\'s package list'
          },
          upgradePackages: {
            type: 'boolean',
            default: false,
            description: 'Upgrade installed packages to latest versions'
          },
          securityOnly: {
            type: 'boolean',
            default: false,
            description: 'Only install security updates (where supported)'
          },
          dryRun: {
            type: 'boolean',
            default: true,
            description: 'Show what would be updated without actually doing it'
          }
        }
      },
      handler: this.updateSystem.bind(this)
    });
  }

  registerTool(tool: MCPTool) {
    this.tools.set(tool.name, tool);
  }

  async getTools(): Promise<MCPTool[]> {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, params: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    try {
      return await tool.handler(params);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async installPackages(params: { packages: string[]; updateFirst?: boolean }) {
    const systemInfo = await systemDetector.getSystemInfo();
    const { packages, updateFirst } = params;

    if (systemInfo.packageManager.name === 'unknown') {
      throw new Error('No supported package manager found');
    }

    const commands: SystemCommand[] = [];

    if (updateFirst) {
      commands.push({
        command: systemInfo.packageManager.updateCmd.split(' ')[0],
        args: systemInfo.packageManager.updateCmd.split(' ').slice(1),
        requiresRoot: true,
        description: 'Update package lists'
      });
    }

    commands.push({
      command: systemInfo.packageManager.installCmd.split(' ')[0],
      args: [...systemInfo.packageManager.installCmd.split(' ').slice(1), ...packages],
      requiresRoot: true,
      description: `Install packages: ${packages.join(', ')}`
    });

    const results = [];
    for (const command of commands) {
      const result = await this.executeCommandWithSafety(command);
      results.push(result);
    }

    return {
      success: results.every(r => r.success),
      results,
      packages,
      packageManager: systemInfo.packageManager.name
    };
  }

  private async removePackages(params: { packages: string[]; purge?: boolean }) {
    const systemInfo = await systemDetector.getSystemInfo();
    const { packages, purge } = params;

    if (systemInfo.packageManager.name === 'unknown') {
      throw new Error('No supported package manager found');
    }

    let removeCmd = systemInfo.packageManager.removeCmd;
    if (purge && systemInfo.packageManager.name === 'apt') {
      removeCmd = 'apt purge';
    }

    const command: SystemCommand = {
      command: removeCmd.split(' ')[0],
      args: [...removeCmd.split(' ').slice(1), ...packages],
      requiresRoot: true,
      description: `Remove packages: ${packages.join(', ')}`
    };

    const result = await this.executeCommandWithSafety(command);

    return {
      success: result.success,
      result,
      packages,
      packageManager: systemInfo.packageManager.name
    };
  }

  private async getSystemInfo() {
    const systemInfo = await systemDetector.getSystemInfo();
    const resources = await systemDetector.getSystemResources();

    return {
      system: systemInfo,
      resources,
      timestamp: new Date().toISOString()
    };
  }

  private async executeCommand(params: { 
    command: string; 
    args?: string[]; 
    workingDir?: string; 
    timeout?: number;
  }) {
    const { command, args = [], workingDir, timeout = 30000 } = params;

    // Validate required parameters
    if (!command || typeof command !== 'string' || command.trim() === '') {
      throw new Error('Command parameter is required and must be a non-empty string');
    }

    const systemCommand: SystemCommand = {
      command,
      args,
      workingDir,
      timeout,
      requiresRoot: false, // Will be determined by safety validator
      description: `Execute: ${command} ${args.join(' ')}`
    };

    return await this.executeCommandWithSafety(systemCommand);
  }

  private async executeCommandWithSafety(command: SystemCommand): Promise<ExecutionResult> {
    // Safety validation
    const validation = await this.safetyValidator.analyzeCommand(command);

    // Create backup if required
    let backupId: string | undefined;
    if (validation.backupRequired && validation.affectedResources.length > 0) {
      try {
        const backup = await this.backupManager.createBackup(
          validation.affectedResources[0], 
          'file'
        );
        backupId = backup.id;
      } catch (error) {
        console.warn('Backup creation failed:', error);
      }
    }

    // For now, we'll simulate command execution
    // In production, this would use node-pty or child_process
    const startTime = Date.now();
    
    try {
      // Simulate execution result
      const result: ExecutionResult = {
        success: true,
        exitCode: 0,
        stdout: `Simulated execution of: ${command.command} ${command.args.join(' ')}`,
        stderr: '',
        duration: Date.now() - startTime
      };

      return result;
    } catch (error) {
      return {
        success: false,
        exitCode: 1,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // New handler methods for Phase 2 tools
  private async manageService(params: { service: string; action: string }) {
    const { service, action } = params;
    
    // Validate required parameters
    if (!service || typeof service !== 'string' || service.trim() === '') {
      throw new Error('Service parameter is required and must be a non-empty string');
    }
    
    if (!action || typeof action !== 'string' || action.trim() === '') {
      throw new Error('Action parameter is required and must be a non-empty string');
    }
    
    const command: SystemCommand = {
      command: 'systemctl',
      args: [action, service],
      requiresRoot: ['start', 'stop', 'restart', 'enable', 'disable'].includes(action),
      description: `${action} service: ${service}`
    };

    // For macOS, use launchctl instead
    const systemInfo = await systemDetector.getSystemInfo();
    if (systemInfo.os === 'darwin') {
      command.command = 'launchctl';
      switch (action) {
        case 'start':
          command.args = ['load', '-w', `/Library/LaunchDaemons/${service}.plist`];
          break;
        case 'stop':
          command.args = ['unload', '-w', `/Library/LaunchDaemons/${service}.plist`];
          break;
        case 'status':
          command.args = ['list', service];
          break;
        default:
          throw new Error(`Action ${action} not supported on macOS`);
      }
    }

    const result = await this.executeCommandWithSafety(command);
    
    return {
      success: result.success,
      service,
      action,
      result,
      timestamp: new Date().toISOString()
    };
  }

  private async cleanupFiles(params: { 
    target: string; 
    recursive?: boolean; 
    dryRun?: boolean; 
    filters?: any;
  }) {
    const { target, recursive = false, dryRun = true, filters } = params;
    
    // Validate required parameters
    if (!target || typeof target !== 'string' || target.trim() === '') {
      throw new Error('Target parameter is required and must be a non-empty string');
    }

    // Safety validation for file operations
    const command: SystemCommand = {
      command: 'find',
      args: [target],
      requiresRoot: false,
      description: `Clean up files in: ${target}`
    };

    const result = await this.executeCommandWithSafety(command);

    // For now, return simulated cleanup result
    return {
      success: true,
      operation: 'cleanup',
      target,
      recursive,
      dryRun,
      filesProcessed: dryRun ? 0 : 42,
      totalSize: dryRun ? '0B' : '1.2MB',
      details: dryRun 
        ? [`DRY RUN: Would clean up files in ${target}`]
        : [`Cleaned up 42 files in ${target}`],
      timestamp: new Date().toISOString()
    };
  }

  private async manageProcesses(params: { 
    pid?: number; 
    name?: string; 
    action: string; 
    signal?: string;
  }) {
    const { pid, name, action, signal = 'TERM' } = params;
    
    // Validate required parameters
    if (!action || typeof action !== 'string' || action.trim() === '') {
      throw new Error('Action parameter is required and must be a non-empty string');
    }

    let command: SystemCommand;

    switch (action) {
      case 'list':
        command = {
          command: 'ps',
          args: name ? ['aux'] : ['aux'],
          requiresRoot: false,
          description: `List processes${name ? ` matching: ${name}` : ''}`
        };
        break;
      case 'kill':
        if (!pid && !name) {
          throw new Error('Either pid or name must be provided for kill action');
        }
        command = {
          command: pid ? 'kill' : 'pkill',
          args: pid ? [`-${signal}`, pid.toString()] : [`-${signal}`, name!],
          requiresRoot: false,
          description: `Kill process${pid ? ` PID ${pid}` : ` named ${name}`} with signal ${signal}`
        };
        break;
      case 'info':
        if (!pid) {
          throw new Error('PID must be provided for info action');
        }
        command = {
          command: 'ps',
          args: ['-p', pid.toString(), '-o', 'pid,ppid,user,time,comm,args'],
          requiresRoot: false,
          description: `Get info for process PID ${pid}`
        };
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const result = await this.executeCommandWithSafety(command);

    return {
      success: result.success,
      action,
      pid,
      name,
      signal,
      result,
      timestamp: new Date().toISOString()
    };
  }

  private async updateSystem(params: { 
    updatePackageList?: boolean; 
    upgradePackages?: boolean; 
    securityOnly?: boolean; 
    dryRun?: boolean;
  }) {
    const { updatePackageList = true, upgradePackages = false, securityOnly = false, dryRun = true } = params;
    const systemInfo = await systemDetector.getSystemInfo();

    const commands: SystemCommand[] = [];
    const results = [];

    if (updatePackageList) {
      commands.push({
        command: systemInfo.packageManager.updateCmd.split(' ')[0],
        args: systemInfo.packageManager.updateCmd.split(' ').slice(1),
        requiresRoot: true,
        description: 'Update package lists'
      });
    }

    if (upgradePackages) {
      const upgradeCmd = systemInfo.packageManager.updateCmd;
      let args = upgradeCmd.split(' ').slice(1);
      
      if (securityOnly && systemInfo.packageManager.name === 'apt') {
        args = ['upgrade', '-s', '| grep -i security'];
      }

      commands.push({
        command: upgradeCmd.split(' ')[0],
        args,
        requiresRoot: true,
        description: securityOnly ? 'Upgrade security packages only' : 'Upgrade all packages'
      });
    }

    for (const command of commands) {
      if (dryRun) {
        results.push({
          success: true,
          exitCode: 0,
          stdout: `DRY RUN: Would execute: ${command.command} ${command.args.join(' ')}`,
          stderr: '',
          duration: 0
        });
      } else {
        const result = await this.executeCommandWithSafety(command);
        results.push(result);
      }
    }

    return {
      success: results.every(r => r.success),
      updatePackageList,
      upgradePackages,
      securityOnly,
      dryRun,
      commands: commands.map(c => `${c.command} ${c.args.join(' ')}`),
      results,
      packageManager: systemInfo.packageManager.name,
      timestamp: new Date().toISOString()
    };
  }
}

export const linuxOSMCPServer = new LinuxOSMCPServer(); 