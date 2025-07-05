// LinuxOS-AI v2 Core Package
// Main exports for system administration capabilities

export * from './types/index.js';
export * from './safety/index.js';
export * from './system/index.js';
export * from './mcp/index.js';
export * from './utils/index.js';

// Version information
export const VERSION = '2.0.0';
export const BUILD_DATE = new Date().toISOString();

// Core constants
export const LINUXOS_AI_CONFIG_DIR = '.linuxos-ai';
export const BACKUP_DIR = 'backups';
export const LOG_DIR = 'logs'; 