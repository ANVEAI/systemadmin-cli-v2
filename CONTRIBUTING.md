# Contributing to SystemAdmin-CLI v2

We're excited that you're interested in contributing to SystemAdmin-CLI v2! This guide will help you get started with contributing to our advanced system administration toolkit.

## 🎯 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **TypeScript**: Version 5.0.0 or higher
- **Git**: Latest version

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/systemadmin-cli-v2.git
   cd systemadmin-cli-v2
   ```

3. **Install dependencies**:
   ```bash
   npm install
   npm run install:all
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

6. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📁 Project Structure

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
├── .github/                  # GitHub workflows and templates
└── package.json
```

## 🛡️ Safety-First Development

SystemAdmin-CLI v2 prioritizes safety above all else. When contributing:

### 1. **Safety Validation**
- All system-modifying operations MUST include safety validation
- Never bypass safety checks for convenience
- Always implement dry-run mode for destructive operations
- Include rollback mechanisms where possible

### 2. **Required Safety Patterns**
```typescript
// REQUIRED: Safety validation for all tools
async validateAndExecute(params: ToolParams): Promise<ToolResult> {
  // 1. Validate parameters
  const validatedParams = await this.validateParams(params);
  
  // 2. Assess risks
  const riskAssessment = await this.assessRisks(validatedParams);
  
  // 3. Require confirmation for high-risk operations
  if (riskAssessment.level >= SafetyLevel.HIGH) {
    const confirmed = await this.requireConfirmation(riskAssessment);
    if (!confirmed) {
      return { success: false, cancelled: true };
    }
  }
  
  // 4. Execute with safeguards
  return await this.executeWithSafeguards(validatedParams);
}
```

### 3. **Testing Safety**
- Every safety mechanism MUST be tested
- Include tests for confirmation dialogs
- Test dry-run mode functionality
- Verify rollback capabilities

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:safety

# Run tests for a specific package
npm run test -w packages/core
```

### Test Categories

1. **Unit Tests**: Test individual functions and classes
2. **Integration Tests**: Test component interactions
3. **Safety Tests**: Validate safety mechanisms
4. **System Tests**: End-to-end functionality
5. **Performance Tests**: Resource usage and response times

### Writing Tests

```typescript
// Example test structure
describe('InstallPackageTool', () => {
  beforeEach(() => {
    // Setup test environment
  });

  it('should validate package names', async () => {
    // Test input validation
  });

  it('should require confirmation for system packages', async () => {
    // Test safety mechanisms
  });

  it('should support dry-run mode', async () => {
    // Test dry-run functionality
  });
});
```

## 📝 Code Style Guidelines

### TypeScript Standards
- Use **strict mode** TypeScript
- Provide comprehensive type definitions
- Use proper async/await patterns
- Implement error boundaries

### Code Formatting
- Use **Prettier** for code formatting
- Use **ESLint** for linting
- Follow existing code style patterns
- Use meaningful variable and function names

### Documentation
- Document all public APIs with JSDoc
- Include examples in documentation
- Explain safety considerations
- Document command-line options

## 🔧 Adding New Commands

### 1. Core Tool Implementation

Create a new tool in `packages/core/src/tools/`:

```typescript
// packages/core/src/tools/new-tool.ts
import { BaseTool } from './base-tool.js';
import { ToolResult } from '../types.js';

export class NewTool extends BaseTool<NewToolParams, ToolResult> {
  constructor() {
    super(
      'new_tool',
      'New Tool',
      'Description of what this tool does',
      newToolSchema,
      true,  // isOutputMarkdown
      false  // canUpdateOutput
    );
  }

  async execute(params: NewToolParams): Promise<ToolResult> {
    // Implement tool logic with safety validation
  }
}
```

### 2. CLI Command Implementation

Create a new command in `packages/cli/src/commands/`:

```typescript
// packages/cli/src/commands/new-command.ts
import { Command } from 'commander';
import { BaseCommand } from './base-command.js';

export class NewCommand extends BaseCommand {
  getCommand(): Command {
    return new Command('new')
      .description('Description of the new command')
      .option('--dry-run', 'show what would be done without executing')
      .action(async (options) => {
        await this.executeWithSafety(options, async () => {
          // Implement command logic
        });
      });
  }
}
```

### 3. Registration

Add your new command to `packages/cli/src/cli.ts`:

```typescript
import { NewCommand } from './commands/new-command.js';

// Add to the program
program.addCommand(new NewCommand().getCommand());
```

## 🏗️ Architecture Guidelines

### MCP Server Development
- Use the Model Context Protocol for tool integration
- Implement proper error handling
- Provide comprehensive tool schemas
- Use stdio transport for local tools

### Cross-Platform Support
- Test on multiple operating systems
- Use appropriate package managers
- Handle platform-specific service management
- Provide fallback mechanisms

### Performance Considerations
- System detection: < 500ms
- Command validation: < 100ms
- Common operations: < 2 seconds
- Maintain responsive UX

## 📋 Pull Request Process

### 1. Before Submitting

- [ ] Code follows the style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Safety mechanisms are implemented
- [ ] Cross-platform compatibility is verified

### 2. Pull Request Requirements

- **Title**: Clear, descriptive title
- **Description**: Explain what changes were made and why
- **Safety Impact**: Describe any safety-related changes
- **Testing**: Describe testing performed
- **Screenshots**: If applicable, include screenshots of CLI output

### 3. Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainers review code quality
3. **Safety Review**: Safety mechanisms are validated
4. **Testing**: Manual testing on multiple platforms
5. **Documentation**: Verify documentation updates

## 🚨 Reporting Issues

### Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security@systemadmin-cli.org with details
- Include steps to reproduce and potential impact

### Bug Reports
Include:
- **Environment**: OS, Node.js version, SystemAdmin-CLI version
- **Command**: Exact command that failed
- **Expected vs Actual**: What you expected vs what happened
- **Logs**: Relevant log output (with sensitive info redacted)

### Feature Requests
Include:
- **Use Case**: Why this feature is needed
- **Proposed Solution**: How you think it should work
- **Alternatives**: Other solutions you've considered
- **Safety Considerations**: Any safety implications

## 📚 Documentation

### Types of Documentation
- **API Documentation**: JSDoc comments in code
- **User Documentation**: README and docs/ directory
- **Architecture Documentation**: Design decisions and patterns
- **Safety Documentation**: Safety mechanisms and best practices

### Writing Guidelines
- Use clear, concise language
- Include examples and code snippets
- Explain safety considerations
- Keep documentation up-to-date with code changes

## 🏆 Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **CHANGELOG.md**: Release notes
- **GitHub**: Contributor graphs and statistics
- **Website**: Contributors page (when available)

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create issues for bugs and feature requests
- **Email**: Contact maintainers at dev@systemadmin-cli.org
- **Chat**: Join our community chat (link in README)

## 📜 License

By contributing to SystemAdmin-CLI v2, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing to SystemAdmin-CLI v2! Your efforts help make system administration safer and more efficient for everyone. 🎉 