// Utility functions for LinuxOS-AI v2

import { ExecutionResult } from '../types/index.js';

export class Logger {
  private static instance: Logger;
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.logLevel = level;
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${new Date().toISOString()} ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${new Date().toISOString()} ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${new Date().toISOString()} ${message}`, ...args);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }
}

export const logger = Logger.getInstance();

export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  errorMessage?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

export function sanitizeCommand(command: string): string {
  // Remove potentially dangerous characters and sequences
  return command
    .replace(/[;&|`$(){}[\]\\]/g, '') // Remove shell special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function validatePackageName(name: string): boolean {
  // Basic package name validation
  // Allow letters, numbers, hyphens, periods, plus signs
  const packageNameRegex = /^[a-zA-Z0-9._+-]+$/;
  return packageNameRegex.test(name) && name.length > 0 && name.length < 256;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = async () => {
      attempts++;
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(error);
        } else {
          logger.warn(`Attempt ${attempts} failed, retrying in ${delayMs}ms...`);
          setTimeout(attempt, delayMs);
        }
      }
    };

    attempt();
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: any;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs);
  };
}

export function isExecutionSuccessful(result: ExecutionResult): boolean {
  return result.success && result.exitCode === 0;
}

export function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        env[key.trim()] = value;
      }
    }
  }
  
  return env;
}

export function escapeShellArg(arg: string): string {
  // Escape shell argument to prevent injection
  return `'${arg.replace(/'/g, "'\"'\"'")}'`;
}

export function createProgressTracker(total: number) {
  let current = 0;
  
  return {
    update(completed: number) {
      current = Math.min(completed, total);
      const percentage = Math.round((current / total) * 100);
      logger.info(`Progress: ${current}/${total} (${percentage}%)`);
    },
    
    increment() {
      this.update(current + 1);
    },
    
    complete() {
      this.update(total);
      logger.info('Operation completed successfully');
    },
    
    get progress() {
      return current / total;
    },
    
    get percentage() {
      return Math.round((current / total) * 100);
    }
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 