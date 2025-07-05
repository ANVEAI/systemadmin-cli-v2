// Safety validation framework for LinuxOS-AI v2

import { SystemCommand, SafetyValidation, SafetyLevel, ConfirmationDetails, BackupInfo } from '../types/index.js';
import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

export class SafetyValidator {
  private destructiveCommands = new Set([
    'rm', 'rmdir', 'unlink', 'mv', 'dd', 'fdisk', 'mkfs', 'format',
    'shutdown', 'reboot', 'halt', 'poweroff', 'init', 'systemctl',
    'service', 'kill', 'killall', 'pkill', 'chmod', 'chown', 'chgrp'
  ]);

  private systemPaths = new Set([
    '/boot', '/etc', '/usr', '/lib', '/lib64', '/sbin', '/bin',
    '/sys', '/proc', '/dev', '/root'
  ]);

  async analyzeCommand(command: SystemCommand): Promise<SafetyValidation> {
    const risks: string[] = [];
    let level = SafetyLevel.SAFE;
    let backupRequired = false;

    // Check for destructive commands
    if (this.destructiveCommands.has(command.command)) {
      risks.push(`Potentially destructive command: ${command.command}`);
      level = Math.max(level, SafetyLevel.MEDIUM_RISK);
    }

    // Check for system path modifications
    const affectedPaths = this.extractPaths(command.args);
    for (const pathStr of affectedPaths) {
      if (this.isSystemPath(pathStr)) {
        risks.push(`Modifying system path: ${pathStr}`);
        level = Math.max(level, SafetyLevel.HIGH_RISK);
        backupRequired = true;
      }
    }

    // Check for root requirement
    if (command.requiresRoot) {
      risks.push('Requires root privileges');
      level = Math.max(level, SafetyLevel.MEDIUM_RISK);
    }

    // Check for package management operations
    if (this.isPackageManagement(command.command)) {
      risks.push('Package management operation');
      level = Math.max(level, SafetyLevel.LOW_RISK);
    }

    // Special cases for highly destructive operations
    if (this.isHighlyDestructive(command)) {
      risks.push('Highly destructive operation detected');
      level = SafetyLevel.DESTRUCTIVE;
      backupRequired = true;
    }

    return {
      level,
      risks,
      confirmationRequired: level >= SafetyLevel.MEDIUM_RISK,
      backupRequired,
      rollbackPlan: backupRequired ? this.generateRollbackPlan(command) : undefined,
      affectedResources: affectedPaths
    };
  }

  private extractPaths(args: string[]): string[] {
    const paths: string[] = [];
    for (const arg of args) {
      if (arg.startsWith('/') || arg.startsWith('./') || arg.startsWith('../')) {
        paths.push(path.resolve(arg));
      }
    }
    return paths;
  }

  private isSystemPath(pathStr: string): boolean {
    return Array.from(this.systemPaths).some(sysPath => 
      pathStr.startsWith(sysPath)
    );
  }

  private isPackageManagement(command: string): boolean {
    const packageManagers = ['apt', 'yum', 'dnf', 'pacman', 'zypper', 'apk', 'brew'];
    return packageManagers.includes(command);
  }

  private isHighlyDestructive(command: SystemCommand): boolean {
    const destructivePatterns = [
      /rm\s+.*-rf?\s+\//, // rm -rf /
      /dd\s+.*of=\/dev/, // dd to device
      /mkfs/, // filesystem creation
      /fdisk/, // disk partitioning
      /shutdown|reboot|halt|poweroff/ // system shutdown
    ];

    const fullCommand = `${command.command} ${command.args.join(' ')}`;
    return destructivePatterns.some(pattern => pattern.test(fullCommand));
  }

  private generateRollbackPlan(command: SystemCommand): string {
    if (command.command === 'rm') {
      return 'Restore files from backup';
    }
    if (this.isPackageManagement(command.command)) {
      return 'Use package manager to reverse operation';
    }
    return 'Manual intervention may be required for rollback';
  }
}

export class BackupManager {
  private backupDir: string;

  constructor(backupDir: string = '.linuxos-ai/backups') {
    this.backupDir = backupDir;
  }

  async createBackup(source: string, type: BackupInfo['type']): Promise<BackupInfo> {
    const id = randomUUID();
    const timestamp = new Date();
    const destination = path.join(this.backupDir, `${id}-${Date.now()}`);

    await fs.mkdir(path.dirname(destination), { recursive: true });

    // Create backup based on type
    let size = 0;
    if (type === 'file') {
      await fs.copyFile(source, destination);
      const stats = await fs.stat(destination);
      size = stats.size;
    } else if (type === 'directory') {
      // Implement directory backup (simplified)
      await this.copyDirectory(source, destination);
      size = await this.getDirectorySize(destination);
    }

    const checksum = await this.calculateChecksum(destination);

    return {
      id,
      timestamp,
      type,
      source,
      destination,
      size,
      checksum
    };
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let size = 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += await this.getDirectorySize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }

    return size;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath);
    return createHash('sha256').update(content).digest('hex');
  }
}

export { SafetyLevel } from '../types/index.js'; 