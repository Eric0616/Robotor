/**
 * OutputFormatter单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OutputFormatter } from './OutputFormatter';

describe('OutputFormatter', () => {
  let formatter: OutputFormatter;

  beforeEach(() => {
    formatter = new OutputFormatter();
  });

  describe('format', () => {
    it('should format simple object correctly', () => {
      // Arrange
      const input = {
        command: 'test',
        args: ['--watch'],
        options: { watch: true },
        success: true
      };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty object', () => {
      // Arrange
      const input = {};

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle complex nested object', () => {
      // Arrange
      const input = {
        command: 'build',
        args: ['--env', 'production'],
        options: {
          env: 'production',
          watch: false
        },
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('✅ Success');
    });

    it('should format success result correctly', () => {
      // Arrange
      const input = { success: true };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toContain('✅ Success');
    });

    it('should format failure result correctly', () => {
      // Arrange
      const input = { success: false, error: 'Build failed' };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toContain('❌ Failed');
      expect(result).toContain('Build failed');
    });

    it('should handle array data', () => {
      // Arrange
      const input = {
        files: ['file1.ts', 'file2.ts', 'file3.ts'],
        count: 3,
        success: true
      };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle null and undefined values', () => {
      // Arrange
      const input = {
        name: 'test',
        value: null,
        optional: undefined,
        success: true
      };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });


  describe('Error Handling', () => {
    it('should handle circular references', () => {
      // Arrange
      const input: any = { name: 'test' };
      input.self = input; // Create circular reference

      // Act & Assert
      expect(() => formatter.format(input)).not.toThrow();
    });

    it('should handle very large objects', () => {
      // Arrange
      const input = {
        data: Array.from({ length: 1000 }, (_, i) => `item${i}`),
        success: true
      };

      // Act & Assert
      expect(() => formatter.format(input)).not.toThrow();
    });

    it('should handle non-serializable objects', () => {
      // Arrange
      const input = {
        func: () => 'test',
        symbol: Symbol('test'),
        success: true
      };

      // Act & Assert
      expect(() => formatter.format(input)).not.toThrow();
    });
  });

  describe('Specialized Formatters', () => {
    it('should format search results correctly', () => {
      // Arrange
      const searchResults = [
        { file: 'src/main.ts', line: 10, text: 'console.log("hello");' },
        { file: 'src/app.ts', line: 25, text: 'const app = express();' }
      ];

      // Act
      const result = formatter.formatSearchResults(searchResults);

      // Assert
      expect(result).toContain('Found 2 results');
      expect(result).toContain('src/main.ts');
      expect(result).toContain('src/app.ts');
    });

    it('should handle empty search results', () => {
      // Arrange
      const searchResults: any[] = [];

      // Act
      const result = formatter.formatSearchResults(searchResults);

      // Assert
      expect(result).toBe('No search results found.');
    });

    it('should format error correctly', () => {
      // Arrange
      const error = 'Build failed with exit code 1';

      // Act
      const result = formatter.formatError(error);

      // Assert
      expect(result).toContain('❌ Error');
      expect(result).toContain('Build failed with exit code 1');
    });

    it('should format success message correctly', () => {
      // Arrange
      const message = 'Build completed successfully';

      // Act
      const result = formatter.formatSuccess(message);

      // Assert
      expect(result).toContain('✅');
      expect(result).toContain('Build completed successfully');
    });

    it('should format info message correctly', () => {
      // Arrange
      const message = 'Starting development server';

      // Act
      const result = formatter.formatInfo(message);

      // Assert
      expect(result).toContain('ℹ️');
      expect(result).toContain('Starting development server');
    });

    it('should format warning message correctly', () => {
      // Arrange
      const message = 'Deprecated feature used';

      // Act
      const result = formatter.formatWarning(message);

      // Assert
      expect(result).toContain('⚠️');
      expect(result).toContain('Deprecated feature used');
    });

    it('should format progress correctly', () => {
      // Arrange
      const current = 5;
      const total = 10;
      const message = 'Processing files';

      // Act
      const result = formatter.formatProgress(current, total, message);

      // Assert
      expect(result).toContain('5/10');
      expect(result).toContain('Processing files');
      expect(result).toContain('50%');
    });
  });

  describe('Mode Settings', () => {
    it('should respect quiet mode', () => {
      // Arrange
      const quietFormatter = new OutputFormatter({ quiet: true });
      const input = { message: 'Hello World', success: true };

      // Act
      const result = quietFormatter.format(input);

      // Assert
      expect(result).toBe('');
    });

    it('should respect verbose mode', () => {
      // Arrange
      const verboseFormatter = new OutputFormatter({ verbose: true });
      const input = {
        command: 'test',
        args: ['--watch'],
        success: true
      };

      // Act
      const result = verboseFormatter.format(input);

      // Assert
      expect(result).toContain('\n'); // JSON format with indentation
    });
  });

  describe('Integration Scenarios', () => {
    it('should format CLI command result correctly', () => {
      // Scenario: CLI command execution result
      const input = {
        command: 'build',
        args: ['--watch', '--env', 'development'],
        exitCode: 0,
        success: true,
        output: 'Build completed successfully',
        duration: 1250
      };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('✅ Success');
    });

    it('should format error result correctly', () => {
      // Scenario: Command execution failed
      const input = {
        command: 'deploy',
        args: ['--env', 'production'],
        exitCode: 1,
        success: false,
        error: 'Deployment failed: connection timeout',
        timestamp: new Date().toISOString()
      };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('❌ Failed');
      expect(result).toContain('Deployment failed: connection timeout');
    });

    it('should format development workflow output', () => {
      // Scenario: Development workflow status
      const input = {
        workflow: 'dev',
        status: 'running',
        processes: [
          { name: 'webpack', status: 'running', port: 3000 },
          { name: 'jest', status: 'watching', files: 42 }
        ],
        success: true
      };

      // Act
      const result = formatter.format(input);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('✅ Success');
    });
  });
});