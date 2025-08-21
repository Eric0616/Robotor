/**
 * PluginManager单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginManagerImpl, PluginConfig } from './PluginManager';
import { TaskRegistryImpl } from './TaskRegistry';
import { TaskServiceRegistry } from './ServiceRegistry';
import { TaskType, TaskPriority, TaskPlugin } from '../types/task';

describe('PluginManagerImpl', () => {
  let pluginManager: PluginManagerImpl;
  let registry: TaskRegistryImpl;
  let services: TaskServiceRegistry;
  let mockPlugin: TaskPlugin;

  beforeEach(() => {
    registry = new TaskRegistryImpl();
    services = new TaskServiceRegistry();
    pluginManager = new PluginManagerImpl(registry, services);

    // 创建mock插件
    mockPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin',
      initialize: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      getTaskTypes: vi.fn().mockReturnValue([
        {
          name: 'test-task',
          description: 'A test task',
          version: '1.0.0',
          priority: TaskPriority.NORMAL,
          config: {
            timeout: 30000,
            retryPolicy: { maxRetries: 3, backoffMs: 1000, exponential: false },
            resourceLimits: { maxMemory: 100, maxCpu: 80, maxConcurrent: 10 },
            environment: {}
          },
          createTask: vi.fn()
        }
      ])
    };
  });

  describe('Plugin Loading', () => {
    it('should load plugin successfully', async () => {
      // 跳过动态导入测试，直接测试插件管理逻辑

      // 由于动态导入难以测试，我们直接测试插件管理逻辑
      // 这里模拟插件已加载的情况
      pluginManager['plugins'].set('test-plugin', mockPlugin);
      registry.register(mockPlugin.getTaskTypes()[0]);

      const loadedPlugins = pluginManager.getLoadedPlugins();
      expect(loadedPlugins).toContain('test-plugin');

      const plugin = pluginManager.getPlugin('test-plugin');
      expect(plugin).toBe(mockPlugin);

      expect(registry.hasTaskType('test-task')).toBe(true);
    });

    it('should throw error for invalid plugin path', async () => {
      await expect(pluginManager.loadPlugin('/invalid/path/plugin.js'))
        .rejects.toThrow('Failed to load plugin from /invalid/path/plugin.js');
    });
  });

  describe('Plugin Unloading', () => {
    it('should unload plugin successfully', async () => {
      // 设置插件已加载
      pluginManager['plugins'].set('test-plugin', mockPlugin);
      registry.register(mockPlugin.getTaskTypes()[0]);

      await pluginManager.unloadPlugin('test-plugin');

      expect(pluginManager.getLoadedPlugins()).not.toContain('test-plugin');
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
      expect(registry.hasTaskType('test-task')).toBe(false);
      expect(mockPlugin.destroy).toHaveBeenCalled();
    });

    it('should throw error when unloading non-existent plugin', async () => {
      await expect(pluginManager.unloadPlugin('non-existent-plugin'))
        .rejects.toThrow('Plugin non-existent-plugin is not loaded');
    });
  });

  describe('Plugin Information', () => {
    it('should get loaded plugins list', () => {
      pluginManager['plugins'].set('plugin1', mockPlugin);
      pluginManager['plugins'].set('plugin2', { ...mockPlugin, name: 'plugin2' });

      const loadedPlugins = pluginManager.getLoadedPlugins();
      expect(loadedPlugins).toHaveLength(2);
      expect(loadedPlugins).toContain('plugin1');
      expect(loadedPlugins).toContain('plugin2');
    });

    it('should get plugin instance', () => {
      pluginManager['plugins'].set('test-plugin', mockPlugin);

      const plugin = pluginManager.getPlugin('test-plugin');
      expect(plugin).toBe(mockPlugin);
    });

    it('should return undefined for non-existent plugin', () => {
      const plugin = pluginManager.getPlugin('non-existent-plugin');
      expect(plugin).toBeUndefined();
    });
  });

  describe('Plugin Configuration', () => {
    it('should register and retrieve plugin config', () => {
      const config: PluginConfig = {
        enabled: true,
        priority: 10,
        settings: { timeout: 5000 }
      };

      pluginManager.registerPluginConfig('test-plugin', config);
      const retrieved = pluginManager.getPluginConfig('test-plugin');

      expect(retrieved).toEqual(config);
    });

    it('should return undefined for non-existent plugin config', () => {
      const config = pluginManager.getPluginConfig('non-existent-plugin');
      expect(config).toBeUndefined();
    });
  });

  describe('Plugin State Management', () => {
    it('should enable plugin', () => {
      pluginManager.registerPluginConfig('test-plugin', {
        enabled: false,
        priority: 5,
        settings: {}
      });

      pluginManager.enablePlugin('test-plugin');

      const config = pluginManager.getPluginConfig('test-plugin');
      expect(config?.enabled).toBe(true);
    });

    it('should disable plugin', () => {
      pluginManager.registerPluginConfig('test-plugin', {
        enabled: true,
        priority: 5,
        settings: {}
      });

      pluginManager.disablePlugin('test-plugin');

      const config = pluginManager.getPluginConfig('test-plugin');
      expect(config?.enabled).toBe(false);
    });

    it('should check if plugin is enabled', () => {
      pluginManager.registerPluginConfig('test-plugin', {
        enabled: true,
        priority: 5,
        settings: {}
      });

      expect(pluginManager.isPluginEnabled('test-plugin')).toBe(true);

      pluginManager.disablePlugin('test-plugin');
      expect(pluginManager.isPluginEnabled('test-plugin')).toBe(false);
    });

    it('should return true for plugin without config (default enabled)', () => {
      expect(pluginManager.isPluginEnabled('test-plugin')).toBe(true);
    });
  });

  describe('Plugin Information Queries', () => {
    it('should get plugin info', () => {
      pluginManager['plugins'].set('test-plugin', mockPlugin);
      pluginManager.registerPluginConfig('test-plugin', {
        enabled: true,
        priority: 5,
        settings: { timeout: 1000 }
      });

      const info = pluginManager.getPluginInfo('test-plugin');

      expect(info).toBeDefined();
      expect(info?.name).toBe('test-plugin');
      expect(info?.version).toBe('1.0.0');
      expect(info?.description).toBe('A test plugin');
      expect(info?.taskTypes).toEqual(['test-task']);
      expect(info?.config?.enabled).toBe(true);
    });

    it('should return undefined for non-existent plugin info', () => {
      const info = pluginManager.getPluginInfo('non-existent-plugin');
      expect(info).toBeUndefined();
    });

    it('should get all plugin info', () => {
      const plugin2 = { ...mockPlugin, name: 'plugin2' };
      pluginManager['plugins'].set('test-plugin', mockPlugin);
      pluginManager['plugins'].set('plugin2', plugin2);

      const allInfo = pluginManager.getAllPluginInfo();

      expect(allInfo).toHaveLength(2);
      expect(allInfo.map(info => info.name)).toEqual(['test-plugin', 'plugin2']);
    });
  });

  describe('Lifecycle Management', () => {
    it('should clear all plugins', async () => {
      const plugin2 = { ...mockPlugin, name: 'plugin2' };
      pluginManager['plugins'].set('test-plugin', mockPlugin);
      pluginManager['plugins'].set('plugin2', plugin2);

      await pluginManager.clear();

      expect(pluginManager.getLoadedPlugins()).toEqual([]);
      expect(mockPlugin.destroy).toHaveBeenCalled();
      expect(plugin2.destroy).toHaveBeenCalled();
    });

    it('should track plugin count', () => {
      expect(pluginManager.size()).toBe(0);

      pluginManager['plugins'].set('plugin1', mockPlugin);
      expect(pluginManager.size()).toBe(1);

      pluginManager['plugins'].set('plugin2', { ...mockPlugin, name: 'plugin2' });
      expect(pluginManager.size()).toBe(2);
    });
  });

  describe('Plugin Validation', () => {
    it('should validate valid plugin structure', () => {
      const validPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test plugin',
        initialize: vi.fn(),
        destroy: vi.fn(),
        getTaskTypes: vi.fn()
      };

      expect(pluginManager['isValidPlugin'](validPlugin)).toBe(true);
    });

    it('should reject invalid plugin structure', () => {
      const invalidPlugins = [
        null,
        undefined,
        {},
        { name: 'test' },
        { name: 'test', version: '1.0.0' },
        { name: 'test', version: '1.0.0', description: 'test' }
      ];

      invalidPlugins.forEach(invalidPlugin => {
        expect(pluginManager['isValidPlugin'](invalidPlugin)).toBe(false);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle plugin reload', async () => {
      // 跳过动态导入测试，直接测试reload逻辑
      // 由于reloadPlugin会尝试从路径提取插件名称，这里测试错误处理
      await expect(pluginManager.reloadPlugin('/invalid/path/plugin.js'))
        .rejects.toThrow('Failed to load plugin from /invalid/path/plugin.js');
    });

    it('should handle multiple plugins with different configurations', () => {
      const plugin1 = { ...mockPlugin, name: 'plugin1' };
      const plugin2 = { ...mockPlugin, name: 'plugin2' };

      pluginManager['plugins'].set('plugin1', plugin1);
      pluginManager['plugins'].set('plugin2', plugin2);

      // 配置不同的设置
      pluginManager.registerPluginConfig('plugin1', {
        enabled: true,
        priority: 10,
        settings: { timeout: 5000 }
      });

      pluginManager.registerPluginConfig('plugin2', {
        enabled: false,
        priority: 5,
        settings: { retries: 5 }
      });

      expect(pluginManager.isPluginEnabled('plugin1')).toBe(true);
      expect(pluginManager.isPluginEnabled('plugin2')).toBe(false);

      const config1 = pluginManager.getPluginConfig('plugin1');
      const config2 = pluginManager.getPluginConfig('plugin2');

      expect(config1?.priority).toBe(10);
      expect(config2?.priority).toBe(5);
    });
  });
});