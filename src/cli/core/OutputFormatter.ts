/**
 * CLI输出格式化器
 * 负责将各种数据格式化为用户友好的终端输出
 */

export class OutputFormatter {
  private isVerbose: boolean = false;
  private isQuiet: boolean = false;

  constructor(options: { verbose?: boolean; quiet?: boolean } = {}) {
    this.isVerbose = options.verbose || false;
    this.isQuiet = options.quiet || false;
  }

  /**
   * 格式化通用结果
   */
  format(result: any): string {
    if (!result) return '';

    if (typeof result === 'string') {
      return this.formatText(result);
    }

    if (Array.isArray(result)) {
      return this.formatList(result);
    }

    if (typeof result === 'object') {
      return this.formatObject(result);
    }

    return String(result);
  }

  /**
   * 格式化文本输出
   */
  private formatText(text: string): string {
    if (this.isQuiet) return '';

    // 处理ANSI颜色代码
    return text.trim();
  }

  /**
   * 格式化列表输出
   */
  private formatList(items: any[]): string {
    if (items.length === 0) return 'No items found.';

    if (this.isQuiet) return '';

    return items.map((item, index) => {
      if (typeof item === 'string') {
        return `${index + 1}. ${item}`;
      }
      if (typeof item === 'object') {
        return `${index + 1}. ${this.formatObject(item)}`;
      }
      return `${index + 1}. ${String(item)}`;
    }).join('\n');
  }

  /**
   * 格式化对象输出
    */
   private formatObject(obj: any): string {
     if (this.isQuiet) return '';

     if (this.isVerbose) {
       // 处理循环引用
       const seen = new WeakSet();
       return JSON.stringify(obj, (key, value) => {
         if (typeof value === 'object' && value !== null) {
           if (seen.has(value)) {
             return '[Circular Reference]';
           }
           seen.add(value);
         }
         return value;
       }, 2);
     }

     // 简洁模式：只显示关键信息
     if (obj.success !== undefined) {
       return obj.success ? '✅ Success' : `❌ Failed: ${obj.error || 'Unknown error'}`;
     }

     if (obj.file && obj.line !== undefined) {
       return `${obj.file}:${obj.line} - ${obj.text || ''}`;
     }

     // 处理循环引用
     const seen = new WeakSet();
     return JSON.stringify(obj, (key, value) => {
       if (typeof value === 'object' && value !== null) {
         if (seen.has(value)) {
           return '[Circular Reference]';
         }
         seen.add(value);
       }
       return value;
     });
   }

  /**
   * 格式化搜索结果
   */
  formatSearchResults(results: any[]): string {
    if (results.length === 0) {
      return 'No search results found.';
    }

    if (this.isQuiet) return '';

    let output = `Found ${results.length} result${results.length === 1 ? '' : 's'}:\n\n`;

    results.forEach((result, index) => {
      output += `${index + 1}. ${result.file || 'Unknown file'}`;
      if (result.line !== undefined) {
        output += `:${result.line}`;
      }
      output += '\n';

      if (result.text && !this.isQuiet) {
        output += `   ${result.text.trim()}\n`;
      }

      output += '\n';
    });

    return output.trim();
  }

  /**
   * 格式化错误信息
   */
  formatError(error: Error | string): string {
    const message = typeof error === 'string' ? error : error.message;

    if (this.isQuiet) return '';

    return `❌ Error: ${message}`;
  }

  /**
   * 格式化成功信息
   */
  formatSuccess(message: string): string {
    if (this.isQuiet) return '';

    return `✅ ${message}`;
  }

  /**
   * 格式化信息消息
   */
  formatInfo(message: string): string {
    if (this.isQuiet) return '';

    return `ℹ️  ${message}`;
  }

  /**
   * 格式化警告消息
   */
  formatWarning(message: string): string {
    if (this.isQuiet) return '';

    return `⚠️  ${message}`;
  }

  /**
   * 设置输出模式
   */
  setMode(options: { verbose?: boolean; quiet?: boolean }): void {
    this.isVerbose = options.verbose || false;
    this.isQuiet = options.quiet || false;
  }

  /**
   * 格式化表格数据
   */
  formatTable(headers: string[], rows: string[][]): string {
    if (this.isQuiet) return '';

    // 计算列宽
    const colWidths = headers.map((header, i) => {
      const cellWidths = [header.length, ...rows.map(row => row[i]?.length || 0)];
      return Math.max(...cellWidths);
    });

    // 构建分隔线
    const separator = colWidths.map(width => '─'.repeat(width)).join('─┼─');
    const fullSeparator = `┼─${separator}─┼`;

    // 格式化表头
    const formattedHeaders = headers.map((header, i) =>
      header.padEnd(colWidths[i])
    ).join(' │ ');

    // 格式化行数据
    const formattedRows = rows.map(row =>
      row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' │ ')
    );

    // 构建完整表格
    return [
      fullSeparator,
      `│ ${formattedHeaders} │`,
      fullSeparator,
      ...formattedRows.map(row => `│ ${row} │`),
      fullSeparator
    ].join('\n');
  }

  /**
   * 格式化进度信息
   */
  formatProgress(current: number, total: number, message?: string): string {
    if (this.isQuiet) return '';

    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);

    let output = `${progressBar} ${current}/${total}`;
    if (message) {
      output += ` - ${message}`;
    }

    return output;
  }

  /**
   * 创建进度条
   */
  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);

    return `[${filledBar}${emptyBar}] ${percentage}%`;
  }
}