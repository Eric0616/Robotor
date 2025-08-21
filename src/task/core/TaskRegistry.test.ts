/**
 * TaskRegistry单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskRegistryImpl, TaskTypeConfig } from './TaskRegistry';
import { TaskType, TaskPriority } from '../types/task';

describe('TaskRegistryImpl', () => {
  let registry: TaskRegistryImpl;
  let mockTaskType: TaskType;

  beforeEach(() => {
    registry = new TaskRegistryImpl();

    // 创建mock任务类型
    mockTaskType = {
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
      createTask: vi.fn((id, inputs) => ({
        id,
        type: 'test-task',
        status: 'created' as any,
        priority: TaskPriority.NORMAL,
        createdAt: new Date(),
        updatedAt: new Date(),
        execute: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getProgress: vi.fn(),
        getMetrics: vi.fn()
      }))
    };
  });

  describe('register', () => {
    it('should register a task type successfully', () => {
      registry.register(mockTaskType);

      expect(registry.hasTaskType('test-task')).toBe(true);
      expect(registry.getTaskType('test-task')).toBe(mockTaskType);
    });

    it('should throw error when registering duplicate task type', () => {
      registry.register(mockTaskType);

      expect(() => registry.register(mockTaskType))
        .toThrow(`Task type ${mockTaskType.name} is already registered`);
    });
  });

  describe('unregister', () => {
    it('should unregister a task type successfully', () => {
      registry.register(mockTaskType);
      expect(registry.hasTaskType('test-task')).toBe(true);

      registry.unregister('test-task');
      expect(registry.hasTaskType('test-task')).toBe(false);
    });

    it('should throw error when unregistering non-existent task type', () => {
      expect(() => registry.unregister('non-existent-task'))
        .toThrow(`Task type non-existent-task is not registered`);
    });
  });

  describe('getTaskType', () => {
    it('should retrieve a registered task type', () => {
      registry.register(mockTaskType);

      const retrieved = registry.getTaskType('test-task');
      expect(retrieved).toBe(mockTaskType);
    });

    it('should return undefined for non-existent task type', () => {
      const retrieved = registry.getTaskType('non-existent-task');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllTaskTypes', () => {
    it('should return all registered task types', () => {
      const taskType2: TaskType = {
        ...mockTaskType,
        name: 'task-2',
        description: 'Second task'
      };

      registry.register(mockTaskType);
      registry.register(taskType2);

      const allTypes = registry.getAllTaskTypes();
      expect(allTypes).toHaveLength(2);
      expect(allTypes).toContain(mockTaskType);
      expect(allTypes).toContain(taskType2);
    });

    it('should return empty array when no task types registered', () => {
      const allTypes = registry.getAllTaskTypes();
      expect(allTypes).toEqual([]);
    });
  });

  describe('hasTaskType', () => {
    it('should return true for registered task type', () => {
      registry.register(mockTaskType);
      expect(registry.hasTaskType('test-task')).toBe(true);
    });

    it('should return false for non-registered task type', () => {
      expect(registry.hasTaskType('non-existent-task')).toBe(false);
    });
  });

  describe('getTaskTypeNames', () => {
    it('should return all task type names', () => {
      const taskType2: TaskType = {
        ...mockTaskType,
        name: 'task-2'
      };

      registry.register(mockTaskType);
      registry.register(taskType2);

      const names = registry.getTaskTypeNames();
      expect(names).toHaveLength(2);
      expect(names).toContain('test-task');
      expect(names).toContain('task-2');
    });
  });

  describe('TaskType Configuration', () => {
    it('should register and retrieve task type config', () => {
      registry.register(mockTaskType);

      const config: TaskTypeConfig = {
        enabled: true,
        priority: 10,
        settings: { timeout: 5000 },
        dependencies: ['dep1'],
        tags: ['important']
      };

      registry.registerTaskTypeConfig('test-task', config);
      const retrieved = registry.getTaskTypeConfig('test-task');

      expect(retrieved).toEqual(config);
    });

    it('should throw error when configuring non-existent task type', () => {
      const config: TaskTypeConfig = {
        enabled: true,
        priority: 10,
        settings: {}
      };

      expect(() => registry.registerTaskTypeConfig('non-existent-task', config))
        .toThrow(`Task type non-existent-task is not registered`);
    });
  });

  describe('Lifecycle Management', () => {
    it('should clear all task types', () => {
      const taskType2: TaskType = {
        ...mockTaskType,
        name: 'task-2'
      };

      registry.register(mockTaskType);
      registry.register(taskType2);
      expect(registry.size()).toBe(2);

      registry.clear();
      expect(registry.size()).toBe(0);
      expect(registry.getTaskTypeNames()).toEqual([]);
    });

    it('should track task type count correctly', () => {
      expect(registry.size()).toBe(0);

      registry.register(mockTaskType);
      expect(registry.size()).toBe(1);

      const taskType2: TaskType = {
        ...mockTaskType,
        name: 'task-2'
      };
      registry.register(taskType2);
      expect(registry.size()).toBe(2);

      registry.unregister('test-task');
      expect(registry.size()).toBe(1);
    });
  });

  describe('Query Methods', () => {
    it('should get task types by priority', () => {
      const highPriorityTask: TaskType = {
        ...mockTaskType,
        name: 'high-task',
        priority: TaskPriority.HIGH
      };

      registry.register(mockTaskType);
      registry.register(highPriorityTask);

      const normalTasks = registry.getTaskTypesByPriority(TaskPriority.NORMAL);
      const highTasks = registry.getTaskTypesByPriority(TaskPriority.HIGH);

      expect(normalTasks).toHaveLength(1);
      expect(normalTasks[0]).toBe(mockTaskType);
      expect(highTasks).toHaveLength(1);
      expect(highTasks[0]).toBe(highPriorityTask);
    });

    it('should get task types by version', () => {
      const v2Task: TaskType = {
        ...mockTaskType,
        name: 'v2-task',
        version: '2.0.0'
      };

      registry.register(mockTaskType);
      registry.register(v2Task);

      const v1Tasks = registry.getTaskTypesByVersion('1.0.0');
      const v2Tasks = registry.getTaskTypesByVersion('2.0.0');

      expect(v1Tasks).toHaveLength(1);
      expect(v1Tasks[0]).toBe(mockTaskType);
      expect(v2Tasks).toHaveLength(1);
      expect(v2Tasks[0]).toBe(v2Task);
    });

    it('should find task types with predicate', () => {
      const enabledTask: TaskType = {
        ...mockTaskType,
        name: 'enabled-task'
      };

      registry.register(mockTaskType);
      registry.register(enabledTask);

      registry.registerTaskTypeConfig('enabled-task', {
        enabled: true,
        priority: 5,
        settings: {}
      });

      const foundTasks = registry.findTaskTypes(taskType =>
        registry.getTaskTypeConfig(taskType.name)?.enabled === true
      );

      expect(foundTasks).toHaveLength(1);
      expect(foundTasks[0]).toBe(enabledTask);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete task type lifecycle', () => {
      // Register task type
      registry.register(mockTaskType);
      expect(registry.hasTaskType('test-task')).toBe(true);

      // Configure task type
      const config: TaskTypeConfig = {
        enabled: true,
        priority: 8,
        settings: { timeout: 10000 },
        tags: ['test', 'demo']
      };
      registry.registerTaskTypeConfig('test-task', config);

      // Verify configuration
      const retrievedConfig = registry.getTaskTypeConfig('test-task');
      expect(retrievedConfig).toEqual(config);

      // Create task instance
      const task = mockTaskType.createTask('test-123', { file: 'test.ts' });
      expect(task).toBeDefined();
      expect(task.id).toBe('test-123');
      expect(task.type).toBe('test-task');

      // Unregister task type
      registry.unregister('test-task');
      expect(registry.hasTaskType('test-task')).toBe(false);
      expect(registry.getTaskTypeConfig('test-task')).toBeUndefined();
    });

    it('should handle multiple task types with different priorities', () => {
      const tasks: TaskType[] = [
        { ...mockTaskType, name: 'low-task', priority: TaskPriority.LOW },
        { ...mockTaskType, name: 'normal-task', priority: TaskPriority.NORMAL },
        { ...mockTaskType, name: 'high-task', priority: TaskPriority.HIGH },
        { ...mockTaskType, name: 'critical-task', priority: TaskPriority.CRITICAL }
      ];

      tasks.forEach(task => registry.register(task));

      expect(registry.size()).toBe(4);
      expect(registry.getTaskTypesByPriority(TaskPriority.LOW)).toHaveLength(1);
      expect(registry.getTaskTypesByPriority(TaskPriority.NORMAL)).toHaveLength(1);
      expect(registry.getTaskTypesByPriority(TaskPriority.HIGH)).toHaveLength(1);
      expect(registry.getTaskTypesByPriority(TaskPriority.CRITICAL)).toHaveLength(1);
    });
  });
});