# 🔧 SystemAdmin-CLI v2

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/workflow/status/systemadmin-cli/systemadmin-cli-v2/CI)](https://github.com/systemadmin-cli/systemadmin-cli-v2/actions)

> **Advanced system administration toolkit with safety-first approach and intelligent automation**

SystemAdmin-CLI v2 is a powerful command-line tool designed for system administrators who need reliable, safe, and efficient system management capabilities. Built with TypeScript and featuring a comprehensive safety framework, it provides enterprise-grade system administration tools with intelligent automation.

## ✨ Key Features

- **🛡️ Safety-First Approach**: Built-in validation and confirmation for destructive operations
- **🔍 Dry-Run Mode**: Test changes before applying them
- **🌐 Cross-Platform**: Full support for Linux distributions and macOS
- **📦 Smart Package Management**: Automatic detection of package managers (apt, yum, brew, etc.)
- **⚙️ Service Management**: Cross-platform service control (systemctl/launchctl)
- **🧹 Intelligent Cleanup**: Advanced file cleanup with smart filtering
- **📊 Process Management**: Comprehensive process monitoring and control
- **🔧 MCP Integration**: Model Context Protocol server for extensibility
- **🎨 Beautiful Interface**: Colorful, intuitive command-line interface

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/systemadmin-cli/systemadmin-cli-v2.git
cd systemadmin-cli-v2

# Install dependencies
npm install

# Build the project
npm run build

# Start using the CLI
./sysadmin-cli --help
```

### First Steps

```bash
# Get system information
./sysadmin-cli system info

# Install a package (dry-run by default)
./sysadmin-cli install docker

# Check service status
./sysadmin-cli service status nginx

# List running processes
./sysadmin-cli process list

# Clean up temporary files
./sysadmin-cli cleanup /tmp --dry-run
```

## 📚 Commands Reference

### System Information
```bash
sysadmin-cli system info              # Comprehensive system information
sysadmin-cli system info --hardware   # Hardware details
sysadmin-cli system info --network    # Network configuration
```

### Package Management
```bash
sysadmin-cli install <package>        # Install package (dry-run)
sysadmin-cli install <package> --confirm  # Actually install
sysadmin-cli update                   # Update package lists
sysadmin-cli update --upgrade         # Upgrade all packages
```

### Service Management
```bash
sysadmin-cli service status <service>    # Check service status
sysadmin-cli service start <service>     # Start service
sysadmin-cli service stop <service>      # Stop service
sysadmin-cli service restart <service>   # Restart service
sysadmin-cli service enable <service>    # Enable service
sysadmin-cli service disable <service>   # Disable service
```

### Process Management
```bash
sysadmin-cli process list             # List running processes
sysadmin-cli process info <pid>       # Get process information
sysadmin-cli process kill <pid>       # Kill process
sysadmin-cli process killall <name>   # Kill processes by name
```

### File System Cleanup
```bash
sysadmin-cli cleanup <path>           # Clean directory (dry-run)
sysadmin-cli cleanup <path> --confirm # Actually clean
sysadmin-cli cleanup /tmp --extensions tmp,log,cache
sysadmin-cli cleanup /var/log --older-than 30d
```

### MCP Server
```bash
sysadmin-cli mcp-server start         # Start MCP server
sysadmin-cli mcp-server stop          # Stop MCP server
sysadmin-cli mcp-server test          # Test MCP server
sysadmin-cli mcp-server list-tools    # List available tools
```

## 🏗️ Architecture

SystemAdmin-CLI v2 follows a modular architecture with clear separation of concerns:

```
systemadmin-cli-v2/
├── packages/
│   ├── core/                 # Core system administration logic
│   │   ├── src/
│   │   │   ├── system/       # System detection and info
│   │   │   ├── safety/       # Safety validation framework
│   │   │   ├── mcp/          # MCP server implementation
│   │   │   └── tools/        # Core administration tools
│   │   └── package.json
│   ├── cli/                  # Command-line interface
│   │   ├── src/
│   │   │   ├── commands/     # CLI command implementations
│   │   │   └── utils/        # CLI utilities
│   │   └── package.json
│   └── ui/                   # Optional UI components
├── docs/                     # Documentation
├── tests/                    # Test files
└── package.json
```

### Core Components

- **SystemDetector**: Automatic OS and package manager detection
- **SafetyValidator**: Pre-execution safety checks and confirmations
- **MCPServer**: Model Context Protocol server for tool integration
- **PackageManager**: Abstract package management interface
- **ServiceManager**: Cross-platform service management
- **ProcessManager**: Process monitoring and control
- **FileManager**: Safe file operations and cleanup

## 🛡️ Safety Features

SystemAdmin-CLI v2 prioritizes safety with multiple layers of protection:

### 1. **Pre-execution Validation**
- Command risk assessment
- System state verification
- Permission checks
- Resource availability validation

### 2. **Confirmation Dialogs**
- Required for destructive operations
- Clear explanation of actions
- Reversibility information
- Impact assessment

### 3. **Dry-Run Mode**
- Test operations without making changes
- Preview of actions to be taken
- Safety impact analysis
- Resource usage estimation

### 4. **Backup and Recovery**
- Automatic backups before destructive operations
- Rollback capabilities
- Recovery instructions
- State restoration

## 🔧 Configuration

SystemAdmin-CLI v2 can be configured through:

### Environment Variables
```bash
export SYSCLI_SAFETY_LEVEL=high     # Safety level (low|medium|high)
export SYSCLI_DRY_RUN=true          # Enable dry-run by default
export SYSCLI_LOG_LEVEL=info        # Log level (debug|info|warn|error)
export SYSCLI_BACKUP_DIR=/tmp/syscli-backups
```

### Configuration File
Create `~/.syscli/config.json`:
```json
{
  "safety": {
    "level": "high",
    "requireConfirmation": true,
    "dryRunDefault": true
  },
  "logging": {
    "level": "info",
    "file": "~/.syscli/logs/syscli.log"
  },
  "backup": {
    "enabled": true,
    "directory": "~/.syscli/backups",
    "retention": "30d"
  }
}
```

## 🧪 Testing

SystemAdmin-CLI v2 includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:safety
```

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: Cross-component functionality
- **Safety Tests**: Validation of safety mechanisms
- **System Tests**: End-to-end functionality
- **Performance Tests**: Resource usage and response times

## 📊 Supported Platforms

| Platform | Support Level | Package Managers | Service Management |
|----------|---------------|------------------|-------------------|
| **Ubuntu/Debian** | ✅ Full | apt, snap | systemctl |
| **CentOS/RHEL** | ✅ Full | yum, dnf | systemctl |
| **Fedora** | ✅ Full | dnf | systemctl |
| **Arch Linux** | ✅ Full | pacman | systemctl |
| **macOS** | ✅ Full | brew | launchctl |
| **Alpine** | 🔄 Partial | apk | rc-service |
| **Windows** | 🔄 Planned | choco | sc.exe |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/systemadmin-cli/systemadmin-cli-v2.git
cd systemadmin-cli-v2

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Code Style
- TypeScript with strict mode
- ESLint for linting
- Prettier for formatting
- Conventional commits

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Command-line interface powered by [Commander.js](https://github.com/tj/commander.js)
- Beautiful terminal output with [Chalk](https://github.com/chalk/chalk) and [Boxen](https://github.com/sindresorhus/boxen)
- MCP integration using [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)

## 📞 Support

- 📖 [Documentation](https://github.com/systemadmin-cli/systemadmin-cli-v2/wiki)
- 🐛 [Bug Reports](https://github.com/systemadmin-cli/systemadmin-cli-v2/issues)
- 💡 [Feature Requests](https://github.com/systemadmin-cli/systemadmin-cli-v2/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/systemadmin-cli/systemadmin-cli-v2/discussions)

---

<div align="center">
  <strong>Built with ❤️ for system administrators worldwide</strong>
</div> 