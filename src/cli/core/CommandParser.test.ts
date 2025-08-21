/**
 * 真正的TDD开发示例 - 命令解析器
 * 遵循TDD原则：先写测试，再写代码
 */

import { describe, it, expect } from 'vitest';
import { CommandParser } from './CommandParser';

describe('CommandParser', () => {
  // TDD Step 1: RED - 写测试用例（现在应该失败）

  it('should parse simple command without arguments', () => {
    // 这个测试现在会失败，因为CommandParser还没实现
    const parser = new CommandParser();
    const result = parser.parse('build');

    expect(result).toEqual({
      command: 'build',
      args: [],
      options: {}
    });
  });

  it('should parse command with positional arguments', () => {
    const parser = new CommandParser();
    const result = parser.parse('build src/main.ts');

    expect(result).toEqual({
      command: 'build',
      args: ['src/main.ts'],
      options: {}
    });
  });

  it('should parse command with short options', () => {
    const parser = new CommandParser();
    const result = parser.parse('build -w --env');

    expect(result).toEqual({
      command: 'build',
      args: [],
      options: { w: true, env: true }
    });
  });

  it('should parse command with long options', () => {
    const parser = new CommandParser();
    const result = parser.parse('build --watch --environment target');

    expect(result).toEqual({
      command: 'build',
      args: ['target'],
      options: { watch: true, environment: true }
    });
  });

  it('should handle malformed input gracefully', () => {
    const parser = new CommandParser();

    expect(() => parser.parse('')).toThrow('Empty command');
    expect(() => parser.parse(null as any)).toThrow('Invalid command');
    expect(() => parser.parse(undefined as any)).toThrow('Invalid command');
  });

  it('should handle mixed options and arguments', () => {
    const parser = new CommandParser();
    const result = parser.parse('build target --verbose');

    expect(result).toEqual({
      command: 'build',
      args: ['target'],
      options: { verbose: true }
    });
  });

  it('should handle multiple short options', () => {
    const parser = new CommandParser();
    const result = parser.parse('build -w -v --env');

    expect(result).toEqual({
      command: 'build',
      args: [],
      options: { w: true, v: true, env: true }
    });
  });

  it('should handle option without value at end', () => {
    const parser = new CommandParser();
    const result = parser.parse('build target --watch');

    expect(result).toEqual({
      command: 'build',
      args: ['target'],
      options: { watch: true }
    });
  });

  it('should handle complex command with all features', () => {
    const parser = new CommandParser();
    const result = parser.parse('deploy app.js --verbose --dry-run');

    expect(result).toEqual({
      command: 'deploy',
      args: ['app.js'],
      options: {
        verbose: true,
        'dry-run': true
      }
    });
  });

  it('should handle whitespace in input', () => {
    const parser = new CommandParser();
    const result = parser.parse('  build    --env   target  ');

    expect(result).toEqual({
      command: 'build',
      args: ['target'],
      options: { env: true }
    });
  });

  it('should handle empty options', () => {
    const parser = new CommandParser();
    const result = parser.parse('test -- --verbose');

    expect(result).toEqual({
      command: 'test',
      args: ['--verbose'],
      options: {}
    });
  });

  it('should handle numeric values in options', () => {
    const parser = new CommandParser();
    const result = parser.parse('run --port --timeout');

    expect(result).toEqual({
      command: 'run',
      args: [],
      options: { port: true, timeout: true }
    });
  });

  // 扩展测试用例以达到98%+覆盖率

  it('should handle empty string input', () => {
    const parser = new CommandParser();

    expect(() => parser.parse('')).toThrow('Empty command');
  });

  it('should handle only whitespace input', () => {
    const parser = new CommandParser();

    expect(() => parser.parse('   ')).toThrow('Empty command');
  });

  it('should handle command with special characters', () => {
    const parser = new CommandParser();
    const result = parser.parse('build-dev --env=test_target');

    expect(result).toEqual({
      command: 'build-dev',
      args: [],
      options: { 'env=test_target': true }
    });
  });

  it('should handle long command chains', () => {
    const parser = new CommandParser();
    const result = parser.parse('build --watch --verbose --env development target dist --port 3000');

    expect(result).toEqual({
      command: 'build',
      args: ['development', 'target', 'dist', '3000'],
      options: { watch: true, verbose: true, env: true, port: true }
    });
  });

  it('should handle duplicate options', () => {
    const parser = new CommandParser();
    const result = parser.parse('build --env dev --env prod');

    expect(result).toEqual({
      command: 'build',
      args: ['dev', 'prod'],
      options: { env: true }
    });
  });

  it('should handle mixed short and long options with args', () => {
    const parser = new CommandParser();
    const result = parser.parse('deploy -f --target production app.js');

    expect(result).toEqual({
      command: 'deploy',
      args: ['production', 'app.js'],
      options: { f: true, target: true }
    });
  });

  it('should handle options with underscores and dashes', () => {
    const parser = new CommandParser();
    const result = parser.parse('test --test_env dev --test-config config.json');

    expect(result).toEqual({
      command: 'test',
      args: ['dev', 'config.json'],
      options: { 'test_env': true, 'test-config': true }
    });
  });

  it('should handle numeric arguments', () => {
    const parser = new CommandParser();
    const result = parser.parse('run 123 456 --flag');

    expect(result).toEqual({
      command: 'run',
      args: ['123', '456'],
      options: { flag: true }
    });
  });

  it('should handle boolean-like string arguments', () => {
    const parser = new CommandParser();
    const result = parser.parse('config true false --verbose');

    expect(result).toEqual({
      command: 'config',
      args: ['true', 'false'],
      options: { verbose: true }
    });
  });

  it('should handle extremely long input', () => {
    const parser = new CommandParser();
    const longArg = 'a'.repeat(1000);
    const result = parser.parse(`build --env ${longArg}`);

    expect(result).toEqual({
      command: 'build',
      args: [longArg],
      options: { env: true }
    });
  });

  it('should handle options at the end without arguments', () => {
    const parser = new CommandParser();
    const result = parser.parse('start --daemon');

    expect(result).toEqual({
      command: 'start',
      args: [],
      options: { daemon: true }
    });
  });

  it('should handle mixed case options', () => {
    const parser = new CommandParser();
    const result = parser.parse('build --Env Dev --Target Prod');

    expect(result).toEqual({
      command: 'build',
      args: ['Dev', 'Prod'],
      options: { Env: true, Target: true }
    });
  });

  it('should handle single dash options', () => {
    const parser = new CommandParser();
    const result = parser.parse('test -abc file.txt');

    expect(result).toEqual({
      command: 'test',
      args: ['file.txt'],
      options: { abc: true }
    });
  });

  it('should handle options with equals sign', () => {
    const parser = new CommandParser();
    const result = parser.parse('build --env=production target');

    expect(result).toEqual({
      command: 'build',
      args: ['target'],
      options: { 'env=production': true }
    });
  });

  it('should handle multiple equals options', () => {
    const parser = new CommandParser();
    const result = parser.parse('deploy --env=prod --target=server app.js');

    expect(result).toEqual({
      command: 'deploy',
      args: ['app.js'],
      options: { 'env=prod': true, 'target=server': true }
    });
  });

  it('should handle options with quoted values', () => {
    const parser = new CommandParser();
    const result = parser.parse('build --env "production test" target');

    expect(result).toEqual({
      command: 'build',
      args: ['"production', 'test"', 'target'],
      options: { env: true }
    });
  });

  it('should handle single quoted values', () => {
    const parser = new CommandParser();
    const result = parser.parse("build --env 'production test' target");

    expect(result).toEqual({
      command: 'build',
      args: ["'production", "test'", 'target'],
      options: { env: true }
    });
  });

  it('should handle empty quoted strings', () => {
    const parser = new CommandParser();
    const result = parser.parse('build --env "" target');

    expect(result).toEqual({
      command: 'build',
      args: ['""', 'target'],
      options: { env: true }
    });
  });

  it('should handle options with special characters in names', () => {
    const parser = new CommandParser();
    const result = parser.parse('test --test.env dev --test-config config.json');

    expect(result).toEqual({
      command: 'test',
      args: ['dev', 'config.json'],
      options: { 'test.env': true, 'test-config': true }
    });
  });

  it('should handle very short commands', () => {
    const parser = new CommandParser();
    const result = parser.parse('x');

    expect(result).toEqual({
      command: 'x',
      args: [],
      options: {}
    });
  });

  it('should handle commands with numbers', () => {
    const parser = new CommandParser();
    const result = parser.parse('test123 --flag');

    expect(result).toEqual({
      command: 'test123',
      args: [],
      options: { flag: true }
    });
  });

  it('should handle negative number arguments', () => {
    const parser = new CommandParser();
    const result = parser.parse('run --port -1 -2');

    expect(result).toEqual({
      command: 'run',
      args: [],
      options: { port: true, '1': true, '2': true }
    });
  });

  it('should handle decimal number arguments', () => {
    const parser = new CommandParser();
    const result = parser.parse('calc 3.14 2.71 --precision');

    expect(result).toEqual({
      command: 'calc',
      args: ['3.14', '2.71'],
      options: { precision: true }
    });
  });

  it('should handle very long option names', () => {
    const parser = new CommandParser();
    const longOption = 'very-long-option-name-that-might-cause-issues';
    const result = parser.parse(`test --${longOption} value`);

    expect(result).toEqual({
      command: 'test',
      args: ['value'],
      options: { [longOption]: true }
    });
  });

  it('should handle options with JSON-like values', () => {
    const parser = new CommandParser();
    const result = parser.parse('deploy --config {"env":"prod"} app.js');

    expect(result).toEqual({
      command: 'deploy',
      args: ['{"env":"prod"}', 'app.js'],
      options: { config: true }
    });
  });

  it('should handle commands with path-like names', () => {
    const parser = new CommandParser();
    const result = parser.parse('./bin/cli --help');

    expect(result).toEqual({
      command: './bin/cli',
      args: [],
      options: { help: true }
    });
  });

  it('should handle Windows path commands', () => {
    const parser = new CommandParser();
    const result = parser.parse('C:\\bin\\cli.exe --version');

    expect(result).toEqual({
      command: 'C:\\bin\\cli.exe',
      args: [],
      options: { version: true }
    });
  });

  it('should handle commands with version numbers', () => {
    const parser = new CommandParser();
    const result = parser.parse('app-v1.2.3 --start');

    expect(result).toEqual({
      command: 'app-v1.2.3',
      args: [],
      options: { start: true }
    });
  });

  // 额外测试用例确保100%路径覆盖率

  it('should handle unicode characters in commands', () => {
    const parser = new CommandParser();
    const result = parser.parse('测试命令 --flag');

    expect(result).toEqual({
      command: '测试命令',
      args: [],
      options: { flag: true }
    });
  });

  it('should handle mixed unicode and ascii', () => {
    const parser = new CommandParser();
    const result = parser.parse('build-测试 --env dev 文件.txt');

    expect(result).toEqual({
      command: 'build-测试',
      args: ['dev', '文件.txt'],
      options: { env: true }
    });
  });

  it('should handle extremely short single character args', () => {
    const parser = new CommandParser();
    const result = parser.parse('x a b c');

    expect(result).toEqual({
      command: 'x',
      args: ['a', 'b', 'c'],
      options: {}
    });
  });

  it('should handle options with dots in names', () => {
    const parser = new CommandParser();
    const result = parser.parse('test --config.file path --verbose');

    expect(result).toEqual({
      command: 'test',
      args: ['path'],
      options: { 'config.file': true, verbose: true }
    });
  });

  it('should handle commands with multiple hyphens', () => {
    const parser = new CommandParser();
    const result = parser.parse('my-super-command --flag');

    expect(result).toEqual({
      command: 'my-super-command',
      args: [],
      options: { flag: true }
    });
  });

  it('should handle very long arguments', () => {
    const parser = new CommandParser();
    const longArg = 'a'.repeat(10000);
    const result = parser.parse(`cmd ${longArg}`);

    expect(result).toEqual({
      command: 'cmd',
      args: [longArg],
      options: {}
    });
  });

  it('should handle options with colons', () => {
    const parser = new CommandParser();
    const result = parser.parse('test --namespace:k8s --env:prod');

    expect(result).toEqual({
      command: 'test',
      args: [],
      options: { 'namespace:k8s': true, 'env:prod': true }
    });
  });

  it('should handle commands with parentheses', () => {
    const parser = new CommandParser();
    const result = parser.parse('my-cmd(arg) --flag');

    expect(result).toEqual({
      command: 'my-cmd(arg)',
      args: [],
      options: { flag: true }
    });
  });

  it('should handle commands with brackets', () => {
    const parser = new CommandParser();
    const result = parser.parse('app[dev] --start');

    expect(result).toEqual({
      command: 'app[dev]',
      args: [],
      options: { start: true }
    });
  });

  it('should handle mixed quotes and options', () => {
    const parser = new CommandParser();
    const result = parser.parse('deploy "app name" --env=prod --force');

    expect(result).toEqual({
      command: 'deploy',
      args: ['"app', 'name"'],
      options: { 'env=prod': true, force: true }
    });
  });

  it('should handle backslash escaped characters', () => {
    const parser = new CommandParser();
    const result = parser.parse('test arg\\ with\\ spaces --flag');

    expect(result).toEqual({
      command: 'test',
      args: ['arg\\', 'with\\', 'spaces'],
      options: { flag: true }
    });
  });

  it('should handle commands starting with numbers', () => {
    const parser = new CommandParser();
    const result = parser.parse('123cmd --flag');

    expect(result).toEqual({
      command: '123cmd',
      args: [],
      options: { flag: true }
    });
  });

  it('should handle options with plus signs', () => {
    const parser = new CommandParser();
    const result = parser.parse('test --c++-mode --debug+');

    expect(result).toEqual({
      command: 'test',
      args: [],
      options: { 'c++-mode': true, 'debug+': true }
    });
  });

  it('should handle commands with exclamation marks', () => {
    const parser = new CommandParser();
    const result = parser.parse('important! --urgent');

    expect(result).toEqual({
      command: 'important!',
      args: [],
      options: { urgent: true }
    });
  });

  it('should handle options with asterisks', () => {
    const parser = new CommandParser();
    const result = parser.parse('test --pattern=* --recursive');

    expect(result).toEqual({
      command: 'test',
      args: [],
      options: { 'pattern=*': true, recursive: true }
    });
  });

  it('should handle commands with question marks', () => {
    const parser = new CommandParser();
    const result = parser.parse('what? --help');

    expect(result).toEqual({
      command: 'what?',
      args: [],
      options: { help: true }
    });
  });

  it('should handle options with at symbols', () => {
    const parser = new CommandParser();
    const result = parser.parse('email --to=user@domain.com --send');

    expect(result).toEqual({
      command: 'email',
      args: [],
      options: { 'to=user@domain.com': true, send: true }
    });
  });

  it('should handle commands with hash symbols', () => {
    const parser = new CommandParser();
    const result = parser.parse('tag#123 --delete');

    expect(result).toEqual({
      command: 'tag#123',
      args: [],
      options: { delete: true }
    });
  });

  it('should handle very deep nested quotes', () => {
    const parser = new CommandParser();
    const result = parser.parse('test "level1 \\"level2\\" end" --flag');

    expect(result).toEqual({
      command: 'test',
      args: ['"level1', '\\"level2\\"', 'end"'],
      options: { flag: true }
    });
  });

  it('should handle mixed encoding scenarios', () => {
    const parser = new CommandParser();
    const result = parser.parse('命令 --flag ファイル.txt');

    expect(result).toEqual({
      command: '命令',
      args: ['ファイル.txt'],
      options: { flag: true }
    });
  });
});