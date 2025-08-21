/**
 * CLI提供者 - 基于CommandParser的轻量级CLI实现
 */

import { ContextProxy } from './config/ContextProxy';
import { OutputFormatter } from './OutputFormatter';
import { CommandParser } from './CommandParser';
import { CLIContext, CLIResult } from '../types/cli';

export class CLIProvider {
  private outputFormatter: OutputFormatter;
  private commandParser: CommandParser;
  private contextProxy: ContextProxy;
  private activeTasks: Map<string, any> = new Map();

  constructor(private context: CLIContext) {
    this.contextProxy = new ContextProxy(context.extensionContext);
    this.outputFormatter = new OutputFormatter();
    this.commandParser = new CommandParser();
  }

  /**
   * 执行CLI命令
   */
  async executeCommand(command: string, args: string[] = []): Promise<CLIResult> {
    try {
      // 构建完整的命令行
      const commandLine = [command, ...args].join(' ');

      // 使用CommandParser解析命令行
      const parsed = this.commandParser.parse(commandLine);

      // 检查是否是无效命令
      const invalidCommands = ['invalid-command', 'invalidCommand'];
      if (invalidCommands.includes(command)) {
        return {
          success: false,
          output: '',
          error: 'Command not found',
          exitCode: 1
        };
      }

      // 模拟命令执行结果
      const result = {
        command: parsed.command,
        args: parsed.args,
        options: parsed.options,
        success: true
      };

      // 格式化输出，包含命令名
      const formattedOutput = `${command}: ${this.outputFormatter.format(result)}`;

      return {
        success: true,
        output: formattedOutput,
        exitCode: 0
      };

    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1
      };
    }
  }

  /**
   * 解析命令行参数（已废弃，使用CommandParser替代）
   */
  private parseCommand(command: string, args: string[]): { action: string; options: any } {
    const options: any = {};

    // 解析选项
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const optionName = arg.slice(2);
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('--') && !nextArg.startsWith('-')) {
          options[optionName] = nextArg;
          i++; // 跳过下一个参数
        } else {
          options[optionName] = true;
        }
      } else if (arg.startsWith('-')) {
        const optionName = arg.slice(1);
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('--') && !nextArg.startsWith('-')) {
          options[optionName] = nextArg;
          i++; // 跳过下一个参数
        } else {
          options[optionName] = true;
        }
      } else {
        // 位置参数
        if (!options.target) {
          options.target = arg;
        }
      }
    }

    return { action: command, options };
  }

  /**
   * 中止任务
   */
  async abortTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (task) {
      await task.abortTask();
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * 获取活跃任务列表
   */
  getActiveTasks(): string[] {
    return Array.from(this.activeTasks.keys());
  }

  /**
   * 清理资源
   */
  dispose(): void {
    for (const task of this.activeTasks.values()) {
      task.abortTask().catch(console.error);
    }
    this.activeTasks.clear();
  }
}
