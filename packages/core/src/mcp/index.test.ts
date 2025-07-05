import { describe, it, expect, beforeEach } from 'vitest';
import { LinuxOSMCPServer } from './index.js';

describe('LinuxOSMCPServer', () => {
  let mcpServer: LinuxOSMCPServer;

  beforeEach(() => {
    mcpServer = new LinuxOSMCPServer();
  });

  describe('Tool Registration', () => {
    it('should register all 8 tools', async () => {
      const tools = await mcpServer.getTools();
      expect(tools).toHaveLength(8);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('install_package');
      expect(toolNames).toContain('remove_package');
      expect(toolNames).toContain('system_info');
      expect(toolNames).toContain('execute_command');
      expect(toolNames).toContain('manage_service');
      expect(toolNames).toContain('cleanup_files');
      expect(toolNames).toContain('manage_processes');
      expect(toolNames).toContain('update_system');
    });

    it('should have proper tool schemas', async () => {
      const tools = await mcpServer.getTools();
      
      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.handler).toBeDefined();
      });
    });
  });

  describe('System Info Tool', () => {
    it('should execute system_info successfully', async () => {
      const result = await mcpServer.executeTool('system_info', {});
      
      expect(result).toBeDefined();
      expect(result.system).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Execute Command Tool', () => {
    it('should execute simple commands', async () => {
      const result = await mcpServer.executeTool('execute_command', {
        command: 'echo',
        args: ['test']
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it('should require command parameter', async () => {
      await expect(mcpServer.executeTool('execute_command', {}))
        .rejects.toThrow();
    });
  });

  describe('Process Management Tool', () => {
    it('should list processes', async () => {
      const result = await mcpServer.executeTool('manage_processes', {
        action: 'list'
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.action).toBe('list');
    });

    it('should require action parameter', async () => {
      await expect(mcpServer.executeTool('manage_processes', {}))
        .rejects.toThrow();
    });
  });

  describe('File Cleanup Tool', () => {
    it('should perform dry-run cleanup', async () => {
      const result = await mcpServer.executeTool('cleanup_files', {
        target: '/tmp',
        dryRun: true
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.filesProcessed).toBe(0);
    });

    it('should require target parameter', async () => {
      await expect(mcpServer.executeTool('cleanup_files', {}))
        .rejects.toThrow();
    });
  });

  describe('Service Management Tool', () => {
    it('should check service status', async () => {
      const result = await mcpServer.executeTool('manage_service', {
        service: 'test-service',
        action: 'status'
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.service).toBe('test-service');
      expect(result.action).toBe('status');
    });

    it('should require service and action parameters', async () => {
      await expect(mcpServer.executeTool('manage_service', { service: 'test' }))
        .rejects.toThrow();
      
      await expect(mcpServer.executeTool('manage_service', { action: 'status' }))
        .rejects.toThrow();
    });
  });

  describe('System Update Tool', () => {
    it('should perform dry-run update', async () => {
      const result = await mcpServer.executeTool('update_system', {
        dryRun: true,
        updatePackageList: false
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.packageManager).toBeDefined();
    });
  });

  describe('Package Management Tools', () => {
    it('should install packages (simulated)', async () => {
      const result = await mcpServer.executeTool('install_package', {
        packages: ['test-package']
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.packages).toContain('test-package');
    });

    it('should remove packages (simulated)', async () => {
      const result = await mcpServer.executeTool('remove_package', {
        packages: ['test-package']
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.packages).toContain('test-package');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tools', async () => {
      await expect(mcpServer.executeTool('unknown_tool', {}))
        .rejects.toThrow('Tool \'unknown_tool\' not found');
    });
  });
}); 