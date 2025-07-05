// LinuxOS-AI v2 CLI Package
// Main exports for the command-line interface

export * from './commands/system-info.js';
export * from './commands/install.js';
export * from './commands/mcp-server.js';

// Re-export core functionality that CLI might need
export { 
  VERSION, 
  systemDetector,
  linuxOSMCPServer,
  SafetyLevel,
  logger 
} from '../../core/dist/index.js'; 