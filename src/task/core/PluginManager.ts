/**
 * 插件管理器实现
 * 基于Task系统重构详细设计v2.0
 */

import { PluginManager, TaskPlugin } from '../types/task';
import { TaskRegistry, ServiceRegistry, PluginContext } from '../types/task';

export class PluginManagerImpl implements PluginManager {
  private plugins = new Map<string, TaskPlugin>();
  private pluginConfigs = new Map<string, PluginConfig>();
  private registry: TaskRegistry;
  private services: ServiceRegistry;

  constructor(registry: TaskRegistry, services: ServiceRegistry) {
    this.registry = registry;
    this.services = services;
  }

  /**
   * 加载插件
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      // 动态导入插件
      const pluginModule = await import(pluginPath);
      const PluginClass = pluginModule.default || pluginModule;

      if (!PluginClass) {
        throw new Error(`No plugin class found in ${pluginPath}`);
      }

      // 创建插件实例
      const plugin = new PluginClass();

      // 验证插件接口
      if (!this.isValidPlugin(plugin)) {
        throw new Error(`Invalid plugin structure in ${pluginPath}`);
      }

      // 检查是否已加载
      if (this.plugins.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} is already loaded`);
      }

      // 创建插件上下文
      const context: PluginContext = {
        registry: this.registry,
        services: this.services,
        config: this.pluginConfigs.get(plugin.name) || {
          enabled: true,
          priority: 5,
          settings: {}
        }
      };

      // 初始化插件
      await plugin.initialize(context);

      // 注册插件提供的任务类型
      const taskTypes = plugin.getTaskTypes();
      for (const taskType of taskTypes) {
        this.registry.register(taskType);
      }

      // 保存插件实例
      this.plugins.set(plugin.name, plugin);

      console.log(`Plugin ${plugin.name} v${plugin.version} loaded successfully`);

    } catch (error) {
      throw new Error(`Failed to load plugin from ${pluginPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);

    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not loaded`);
    }

    try {
      // 销毁插件
      await plugin.destroy();

      // 移除插件提供的任务类型
      const taskTypes = plugin.getTaskTypes();
      for (const taskType of taskTypes) {
        if (this.registry.hasTaskType(taskType.name)) {
          this.registry.unregister(taskType.name);
        }
      }

      // 移除插件实例
      this.plugins.delete(pluginName);
      this.pluginConfigs.delete(pluginName);

      console.log(`Plugin ${plugin.name} unloaded successfully`);

    } catch (error) {
      throw new Error(`Failed to unload plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取已加载的插件列表
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * 获取插件实例
   */
  getPlugin(pluginName: string): TaskPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * 注册插件配置
   */
  registerPluginConfig(pluginName: string, config: PluginConfig): void {
    this.pluginConfigs.set(pluginName, config);
  }

  /**
   * 获取插件配置
   */
  getPluginConfig(pluginName: string): PluginConfig | undefined {
    return this.pluginConfigs.get(pluginName);
  }

  /**
   * 重新加载插件
   */
  async reloadPlugin(pluginPath: string): Promise<void> {
    // 从路径提取插件名称（简单实现）
    const pluginName = pluginPath.split('/').pop()?.replace(/\.(js|ts)$/, '') || 'unknown';

    // 如果插件已加载，先卸载
    if (this.plugins.has(pluginName)) {
      await this.unloadPlugin(pluginName);
    }

    // 重新加载
    await this.loadPlugin(pluginPath);
  }

  /**
   * 获取插件信息
   */
  getPluginInfo(pluginName: string): PluginInfo | undefined {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return undefined;
    }

    return {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      taskTypes: plugin.getTaskTypes().map(type => type.name),
      config: this.pluginConfigs.get(pluginName)
    };
  }

  /**
   * 获取所有插件信息
   */
  getAllPluginInfo(): PluginInfo[] {
    return this.getLoadedPlugins().map(name => this.getPluginInfo(name)!).filter(Boolean);
  }

  /**
   * 启用插件
   */
  enablePlugin(pluginName: string): void {
    const config = this.pluginConfigs.get(pluginName) || {
      enabled: false,
      priority: 5,
      settings: {}
    };
    config.enabled = true;
    this.pluginConfigs.set(pluginName, config);
  }

  /**
   * 禁用插件
   */
  disablePlugin(pluginName: string): void {
    const config = this.pluginConfigs.get(pluginName) || {
      enabled: true,
      priority: 5,
      settings: {}
    };
    config.enabled = false;
    this.pluginConfigs.set(pluginName, config);
  }

  /**
   * 检查插件是否启用
   */
  isPluginEnabled(pluginName: string): boolean {
    const config = this.pluginConfigs.get(pluginName);
    return config ? config.enabled : true; // 默认启用
  }

  /**
   * 清理所有插件
   */
  async clear(): Promise<void> {
    const pluginNames = this.getLoadedPlugins();

    for (const pluginName of pluginNames) {
      await this.unloadPlugin(pluginName);
    }
  }

  /**
   * 获取插件数量
   */
  size(): number {
    return this.plugins.size;
  }

  /**
   * 验证插件结构
   */
  private isValidPlugin(obj: any): obj is TaskPlugin {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      typeof obj.name === 'string' &&
      typeof obj.version === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.initialize === 'function' &&
      typeof obj.destroy === 'function' &&
      typeof obj.getTaskTypes === 'function'
    );
  }
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  enabled: boolean;
  priority: number;
  settings: Record<string, any>;
}

/**
 * 插件信息接口
 */
export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  taskTypes: string[];
  config?: PluginConfig;
}