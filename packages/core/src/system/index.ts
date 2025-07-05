// System detection and management for LinuxOS-AI v2

import { SystemInfo, PackageManager } from '../types/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

export class SystemDetector {
  private static instance: SystemDetector;
  private cachedSystemInfo: SystemInfo | null = null;

  static getInstance(): SystemDetector {
    if (!SystemDetector.instance) {
      SystemDetector.instance = new SystemDetector();
    }
    return SystemDetector.instance;
  }

  async getSystemInfo(): Promise<SystemInfo> {
    if (this.cachedSystemInfo) {
      return this.cachedSystemInfo;
    }

    const systemInfo: SystemInfo = {
      os: os.platform(),
      distro: await this.detectDistribution(),
      kernel: os.release(),
      arch: os.arch(),
      packageManager: await this.detectPackageManager(),
      shell: process.env.SHELL || '/bin/sh',
      user: os.userInfo().username,
      isRoot: process.getuid ? process.getuid() === 0 : false
    };

    this.cachedSystemInfo = systemInfo;
    return systemInfo;
  }

  private async detectDistribution(): Promise<string> {
    try {
      // Try to read /etc/os-release
      const { stdout } = await execAsync('cat /etc/os-release');
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.startsWith('PRETTY_NAME=')) {
          return line.split('=')[1].replace(/"/g, '');
        }
      }
    } catch (error) {
      // Fallback methods
    }

    try {
      // Try lsb_release
      const { stdout } = await execAsync('lsb_release -d');
      return stdout.split('\t')[1]?.trim() || 'Unknown';
    } catch (error) {
      // Final fallback
    }

    return 'Unknown Linux Distribution';
  }

  private async detectPackageManager(): Promise<PackageManager> {
    const packageManagers = [
      {
        name: 'apt' as const,
        command: 'apt',
        installCmd: 'apt install',
        removeCmd: 'apt remove',
        updateCmd: 'apt update && apt upgrade',
        searchCmd: 'apt search',
        listCmd: 'apt list --installed'
      },
      {
        name: 'yum' as const,
        command: 'yum',
        installCmd: 'yum install',
        removeCmd: 'yum remove',
        updateCmd: 'yum update',
        searchCmd: 'yum search',
        listCmd: 'yum list installed'
      },
      {
        name: 'dnf' as const,
        command: 'dnf',
        installCmd: 'dnf install',
        removeCmd: 'dnf remove',
        updateCmd: 'dnf update',
        searchCmd: 'dnf search',
        listCmd: 'dnf list installed'
      },
      {
        name: 'pacman' as const,
        command: 'pacman',
        installCmd: 'pacman -S',
        removeCmd: 'pacman -R',
        updateCmd: 'pacman -Syu',
        searchCmd: 'pacman -Ss',
        listCmd: 'pacman -Q'
      },
      {
        name: 'zypper' as const,
        command: 'zypper',
        installCmd: 'zypper install',
        removeCmd: 'zypper remove',
        updateCmd: 'zypper update',
        searchCmd: 'zypper search',
        listCmd: 'zypper search --installed-only'
      },
      {
        name: 'apk' as const,
        command: 'apk',
        installCmd: 'apk add',
        removeCmd: 'apk del',
        updateCmd: 'apk update && apk upgrade',
        searchCmd: 'apk search',
        listCmd: 'apk info'
      },
      {
        name: 'brew' as const,
        command: 'brew',
        installCmd: 'brew install',
        removeCmd: 'brew uninstall',
        updateCmd: 'brew update && brew upgrade',
        searchCmd: 'brew search',
        listCmd: 'brew list'
      }
    ];

    for (const pm of packageManagers) {
      try {
        await execAsync(`which ${pm.command}`);
        return {
          name: pm.name,
          installCmd: pm.installCmd,
          removeCmd: pm.removeCmd,
          updateCmd: pm.updateCmd,
          searchCmd: pm.searchCmd,
          listCmd: pm.listCmd
        };
      } catch (error) {
        // Continue to next package manager
      }
    }

    return {
      name: 'unknown',
      installCmd: '',
      removeCmd: '',
      updateCmd: '',
      searchCmd: '',
      listCmd: ''
    };
  }

  async isCommandAvailable(command: string): Promise<boolean> {
    try {
      await execAsync(`which ${command}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSystemResources(): Promise<{
    memory: { total: number; free: number; used: number };
    disk: { total: number; free: number; used: number };
    cpu: { count: number; load: number[] };
  }> {
    const memory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };

    const cpu = {
      count: os.cpus().length,
      load: os.loadavg()
    };

    // Simplified disk usage - in production, use systeminformation package
    const disk = {
      total: 0,
      free: 0,
      used: 0
    };

    try {
      const { stdout } = await execAsync('df -h / | tail -1');
      const parts = stdout.trim().split(/\s+/);
      if (parts.length >= 4) {
        disk.total = this.parseSize(parts[1]);
        disk.used = this.parseSize(parts[2]);
        disk.free = this.parseSize(parts[3]);
      }
    } catch (error) {
      // Fallback to defaults
    }

    return { memory, disk, cpu };
  }

  private parseSize(sizeStr: string): number {
    const units = { K: 1024, M: 1024**2, G: 1024**3, T: 1024**4 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT]?)$/);
    if (!match) return 0;
    
    const [, size, unit] = match;
    const multiplier = units[unit as keyof typeof units] || 1;
    return parseFloat(size) * multiplier;
  }
}

export const systemDetector = SystemDetector.getInstance(); 