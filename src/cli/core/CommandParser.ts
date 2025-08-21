/**
 * 命令解析器 - TDD实现
 * 遵循TDD原则：实现最简单的代码让测试通过
 */

export interface ParsedCommand {
  command: string;
  args: string[];
  options: Record<string, any>;
}

export class CommandParser {
  parse(input: string): ParsedCommand {
    if (typeof input !== 'string') {
      throw new Error('Invalid command');
    }

    if (!input || input.trim() === '') {
      throw new Error('Empty command');
    }

    // 简单的命令解析实现
    const parts = input.trim().split(/\s+/);
    const command = parts[0];
    const args: string[] = [];
    const options: Record<string, any> = {};

    let parsingOptions = true; // 标记是否正在解析选项

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      if (parsingOptions && part === '--') {
        // 遇到 -- 停止解析选项，后续都是位置参数
        parsingOptions = false;
        continue;
      }

      if (parsingOptions && part.startsWith('--')) {
        // 长选项
        const optionName = part.slice(2);
        if (optionName === '') {
          // 处理空选项名的情况
          continue;
        }

        options[optionName] = true; // 默认为布尔值
      } else if (parsingOptions && part.startsWith('-') && part !== '-') {
        // 短选项
        const optionName = part.slice(1);
        options[optionName] = true; // 默认为布尔值
      } else {
        // 位置参数
        args.push(part);
      }
    }

    return {
      command,
      args,
      options
    };
  }
}