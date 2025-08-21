/**
 * CLI环境下的ContextProxy实现
 * 提供基本的配置存储和访问功能
 */

export class ContextProxy {
  private storage: Map<string, any> = new Map();
  private secrets: Map<string, string> = new Map();

  constructor(private context: any) {}

  /**
   * 获取全局状态值
   */
  getGlobalState<T>(key: string): T | undefined {
    return this.storage.get(key);
  }

  /**
   * 更新全局状态值
   */
  updateGlobalState<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  /**
   * 存储密钥
   */
  async storeSecret(key: string, value: string): Promise<void> {
    this.secrets.set(key, value);
  }

  /**
   * 获取密钥
   */
  async getSecret(key: string): Promise<string | undefined> {
    return this.secrets.get(key);
  }

  /**
   * 删除密钥
   */
  async deleteSecret(key: string): Promise<void> {
    this.secrets.delete(key);
  }

  /**
   * 获取工作区存储URI
   */
  get workspaceStorageUri(): any {
    return {
      fsPath: process.cwd()
    };
  }

  /**
   * 获取全局存储URI
   */
  get globalStorageUri(): any {
    return {
      fsPath: process.cwd()
    };
  }

  /**
   * 刷新密钥（在CLI环境下不需要实际刷新）
   */
  async refreshSecrets(): Promise<void> {
    // CLI环境下不需要实际刷新
  }

  /**
   * 设置值（简化版本）
   */
  async setValue<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  /**
   * 设置多个值
   */
  async setValues(values: Record<string, any>): Promise<void> {
    Object.entries(values).forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }

  /**
   * 获取值
   */
  async getValue<T>(key: string): Promise<T | undefined> {
    return this.storage.get(key);
  }

  /**
   * 导出所有配置
   */
  async export(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const [key, value] of this.storage.entries()) {
      result[key] = value;
    }

    return result;
  }
}