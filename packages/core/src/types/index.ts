// Core type definitions for LinuxOS-AI v2

export interface SystemInfo {
  os: string;
  distro: string;
  kernel: string;
  arch: string;
  packageManager: PackageManager;
  shell: string;
  user: string;
  isRoot: boolean;
}

export interface PackageManager {
  name: 'apt' | 'yum' | 'dnf' | 'pacman' | 'zypper' | 'apk' | 'brew' | 'unknown';
  installCmd: string;
  removeCmd: string;
  updateCmd: string;
  searchCmd: string;
  listCmd: string;
}

export interface SafetyValidation {
  level: SafetyLevel;
  risks: string[];
  confirmationRequired: boolean;
  backupRequired: boolean;
  rollbackPlan?: string;
  affectedResources: string[];
}

export enum SafetyLevel {
  SAFE = 0,
  LOW_RISK = 1,
  MEDIUM_RISK = 2,
  HIGH_RISK = 3,
  DESTRUCTIVE = 4
}

export interface SystemCommand {
  command: string;
  args: string[];
  workingDir?: string;
  env?: Record<string, string>;
  timeout?: number;
  requiresRoot?: boolean;
  description: string;
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  cancelled?: boolean;
  error?: string;
}

export interface BackupInfo {
  id: string;
  timestamp: Date;
  type: 'file' | 'directory' | 'package' | 'service';
  source: string;
  destination: string;
  size: number;
  checksum: string;
}

export interface ConfirmationDetails {
  title: string;
  message: string;
  risks: string[];
  affectedResources: string[];
  backupPlan?: string;
  rollbackPlan?: string;
  requiresExplicitYes?: boolean;
} 