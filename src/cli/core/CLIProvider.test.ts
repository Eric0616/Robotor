/**
 * CLIProvider单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { CLIProvider } from './CLIProvider';
import { CLIContext, CLIResult } from '../types/cli';

// Mock依赖
vi.mock('../../core/webview/ClineProvider');
vi.mock('./config/ContextProxy');
vi.mock('../../core/task/Task');

describe('CLIProvider', () => {
  let cliProvider: CLIProvider;
  let mockContext: CLIContext;

  beforeEach(() => {
    // 创建mock上下文
    mockContext = {
      extensionContext: {
        globalState: {
          get: vi.fn(),
          update: vi.fn(),
          keys: vi.fn().mockReturnValue([]),
          setKeysForSync: vi.fn(),
        },
        workspaceState: {
          get: vi.fn(),
          update: vi.fn(),
          keys: vi.fn().mockReturnValue([]),
        },
        subscriptions: [],
        extensionPath: '/test/path',
        extensionUri: {} as any,
        environmentVariableCollection: {} as any,
        storageUri: undefined,
        globalStorageUri: {} as any,
        logUri: {} as any,
        extensionMode: 3,
        secrets: {} as any,
        extension: undefined,
      },
      outputChannel: {
        name: 'Test CLI',
        append: vi.fn(),
        appendLine: vi.fn(),
        clear: vi.fn(),
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn(),
      },
    };

    cliProvider = new CLIProvider(mockContext);
  });

  describe('executeCommand', () => {
    it('should execute build command successfully', async () => {
      // Arrange
      const command = 'build';
      const args = ['--watch'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.exitCode).toBe(0);
    });

    it('should handle command execution failure', async () => {
      // Arrange
      const command = 'invalid-command';
      const args: string[] = [];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.exitCode).toBe(1);
    });

    it('should parse command arguments correctly', async () => {
      // Arrange
      const command = 'build';
      const args = ['target', '--env', 'production', '--watch'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle empty arguments', async () => {
      // Arrange
      const command = 'help';
      const args: string[] = [];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('abortTask', () => {
    it('should abort running task successfully', async () => {
      // Arrange
      const taskId = 'test-task-123';

      // Act & Assert
      await expect(cliProvider.abortTask(taskId)).resolves.toBeUndefined();
    });

    it('should handle non-existent task gracefully', async () => {
      // Arrange
      const nonExistentTaskId = 'non-existent-task';

      // Act & Assert
      await expect(cliProvider.abortTask(nonExistentTaskId)).resolves.toBeUndefined();
    });
  });

  describe('getActiveTasks', () => {
    it('should return empty array when no tasks are running', () => {
      // Act
      const activeTasks = cliProvider.getActiveTasks();

      // Assert
      expect(activeTasks).toEqual([]);
    });
  });

  describe('dispose', () => {
    it('should clean up resources successfully', () => {
      // Act & Assert
      expect(() => cliProvider.dispose()).not.toThrow();
    });
  });
});

describe('CLIProvider Integration', () => {
  let cliProvider: CLIProvider;

  beforeEach(() => {
    const mockContext: CLIContext = {
      extensionContext: {
        globalState: {
          get: vi.fn(),
          update: vi.fn(),
          keys: vi.fn().mockReturnValue([]),
          setKeysForSync: vi.fn(),
        },
        workspaceState: {
          get: vi.fn(),
          update: vi.fn(),
          keys: vi.fn().mockReturnValue([]),
        },
        subscriptions: [],
        extensionPath: '/test/path',
        extensionUri: {} as any,
        environmentVariableCollection: {} as any,
        storageUri: undefined,
        globalStorageUri: {} as any,
        logUri: {} as any,
        extensionMode: 3,
        secrets: {} as any,
        extension: undefined,
      },
      outputChannel: {
        name: 'Test CLI',
        append: vi.fn(),
        appendLine: vi.fn(),
        clear: vi.fn(),
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn(),
      },
    };

    cliProvider = new CLIProvider(mockContext);
  });

  describe('Command Pipeline', () => {
    it('should handle build command with watch mode', async () => {
      // Arrange
      const command = 'build';
      const args = ['--watch', '--env', 'development'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('build');
      expect(result.exitCode).toBe(0);
    });

    it('should handle debug command with file path', async () => {
      // Arrange
      const command = 'debug';
      const args = ['src/main.ts'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('debug');
    });

    it('should handle refactor command with pattern', async () => {
      // Arrange
      const command = 'refactor';
      const args = ['--pattern', 'oldFunc', '--replacement', 'newFunc'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('refactor');
    });

    it('should handle review command', async () => {
      // Arrange
      const command = 'review';
      const args = ['src/app.ts'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('review');
    });

    it('should handle deploy command with environment', async () => {
      // Arrange
      const command = 'deploy';
      const args = ['--env', 'production'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('deploy');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', async () => {
      // Arrange
      const invalidCommand = 'invalid-command';
      const args: string[] = [];

      // Act
      const result = await cliProvider.executeCommand(invalidCommand, args);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.exitCode).toBe(1);
    });

    it('should handle malformed arguments', async () => {
      // Arrange
      const command = 'build';
      const malformedArgs = ['--invalid-option', '--incomplete'];

      // Act
      const result = await cliProvider.executeCommand(command, malformedArgs);

      // Assert
      expect(result.success).toBe(true); // CLI should handle malformed args gracefully
    });
  });

  describe('Resource Management', () => {
    it('should manage task lifecycle correctly', async () => {
      // Arrange
      const command = 'build';

      // Act
      const result1 = await cliProvider.executeCommand(command, []);
      const activeTasks1 = cliProvider.getActiveTasks();

      await cliProvider.abortTask('all');
      const activeTasks2 = cliProvider.getActiveTasks();

      // Assert
      expect(result1.success).toBe(true);
      expect(activeTasks1.length).toBe(0); // Tasks complete immediately in mock
      expect(activeTasks2.length).toBe(0);
    });

    it('should clean up resources on dispose', () => {
      // Act & Assert
      expect(() => cliProvider.dispose()).not.toThrow();
    });
  });

  // 真实开发场景集成测试
  describe('Real Developer Scenarios', () => {
    it('should handle typical build command with multiple options', async () => {
      // Scenario: Developer builds project with watch mode and custom config
      const command = 'build';
      const args = ['--watch', '--env', 'development', '--config', 'webpack.config.js'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('build');
      expect(result.exitCode).toBe(0);
    });

    it('should handle debugging session setup', async () => {
      // Scenario: Developer starts debugging with source maps
      const command = 'debug';
      const args = ['--source-maps', '--port', '9229', 'src/index.ts'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('debug');
    });

    it('should handle code refactoring with pattern matching', async () => {
      // Scenario: Developer refactors old function names
      const command = 'refactor';
      const args = ['--pattern', 'oldFunction', '--replacement', 'newFunction', '--dry-run'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('refactor');
    });

    it('should handle deployment with environment variables', async () => {
      // Scenario: Developer deploys to staging with custom settings
      const command = 'deploy';
      const args = ['--env', 'staging', '--branch', 'feature/new-ui', '--force'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('deploy');
    });

    it('should handle code review with specific file patterns', async () => {
      // Scenario: Developer reviews TypeScript files only
      const command = 'review';
      const args = ['--pattern', '*.ts', '--exclude', 'node_modules/**', '--verbose'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('review');
    });

    it('should handle test execution with coverage', async () => {
      // Scenario: Developer runs tests with coverage reporting
      const command = 'test';
      const args = ['--coverage', '--reporter', 'html', '--watch'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('test');
    });

    it('should handle linting with autofix', async () => {
      // Scenario: Developer runs linter with automatic fixes
      const command = 'lint';
      const args = ['--fix', '--ext', '.ts,.js', 'src/'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('lint');
    });

    it('should handle dependency installation with specific packages', async () => {
      // Scenario: Developer installs development dependencies
      const command = 'install';
      const args = ['--save-dev', 'typescript', 'jest', '@types/node'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('install');
    });

    it('should handle git operations with complex commands', async () => {
      // Scenario: Developer performs complex git operation
      const command = 'git';
      const args = ['commit', '--message', 'feat: add new CLI integration', '--amend', '--no-edit'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('git');
    });

    it('should handle docker operations with port mapping', async () => {
      // Scenario: Developer runs docker container with port forwarding
      const command = 'docker';
      const args = ['run', '--publish', '3000:3000', '--detach', 'myapp:latest'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('docker');
    });

    it('should handle npm scripts with custom arguments', async () => {
      // Scenario: Developer runs npm script with arguments
      const command = 'npm';
      const args = ['run', 'build', '--', '--env=production', '--analyze'];

      // Act
      const result = await cliProvider.executeCommand(command, args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toContain('npm');
    });

    it('should handle complex chained operations', async () => {
      // Scenario: Developer performs multiple operations in sequence
      const operations = [
        ['build', ['--watch', '--env', 'dev']],
        ['test', ['--coverage']],
        ['lint', ['--fix']]
      ];

      for (const [command, args] of operations) {
        // Act
        const result = await cliProvider.executeCommand(command as string, args as string[]);

        // Assert
        expect(result.success).toBe(true);
        expect(result.output).toContain(command as string);
        expect(result.exitCode).toBe(0);
      }
    });

    it('should handle invalid operations gracefully', async () => {
      // Scenario: Developer makes typos or uses invalid commands
      const invalidCommands = [
        ['buidl', ['--watch']], // typo in build
        ['invalid-command', ['--help']],
        ['test', ['--invalid-flag', 'value']]
      ];

      for (const [command, args] of invalidCommands) {
        // Act
        const result = await cliProvider.executeCommand(command as string, args as string[]);

        // Assert - should handle errors gracefully
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
        expect(typeof result.exitCode).toBe('number');
      }
    });

    it('should handle long-running development workflow', async () => {
      // Scenario: Developer workflow with multiple dev tools
      const workflow = [
        ['install', []],
        ['build', ['--watch', '--env', 'development']],
        ['test', ['--watch']],
        ['lint', ['--watch']]
      ];

      // Act & Assert
      for (const [command, args] of workflow) {
        const result = await cliProvider.executeCommand(command as string, args as string[]);
        expect(result.success).toBe(true);
        expect(result.output).toContain(command as string);
      }

      // Verify resources can be cleaned up
      expect(() => cliProvider.dispose()).not.toThrow();
    });
  });
});