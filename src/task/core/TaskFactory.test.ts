/**
 * TaskFactory单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskFactoryImpl } from './TaskFactory';
import { TaskRegistryImpl } from './TaskRegistry';
import { TaskType, TaskPriority } from '../types/task';

describe('TaskFactoryImpl', () => {
  let factory: TaskFactoryImpl;
  let registry: TaskRegistryImpl;
  let mockTaskType: TaskType;

  beforeEach(() => {
    registry = new TaskRegistryImpl();
    factory = new TaskFactoryImpl(registry);

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

    registry.register(mockTaskType);
  });

  describe('createTask', () => {
    it('should create a task successfully', () => {
      const taskId = 'test-123';
      const inputs = { file: 'test.ts' };

      const task = factory.createTask('test-task', taskId, inputs);

      expect(task).toBeDefined();
      expect(task.id).toBe(taskId);
      expect(task.type).toBe('test-task');
      expect(mockTaskType.createTask).toHaveBeenCalledWith(taskId, inputs);
    });

    it('should throw error for non-existent task type', () => {
      const taskId = 'test-123';
      const inputs = { file: 'test.ts' };

      expect(() => factory.createTask('non-existent-task', taskId, inputs))
        .toThrow('Task type non-existent-task not found');
    });

    it('should cache created tasks', () => {
      const taskId = 'test-123';
      const inputs = { file: 'test.ts' };

      const task1 = factory.createTask('test-task', taskId, inputs);
      const task2 = factory.createTask('test-task', taskId, inputs);

      expect(task1).toBe(task2); // 应该返回缓存的任务
      expect(mockTaskType.createTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSupportedTaskTypes', () => {
    it('should return supported task types', () => {
      const supportedTypes = factory.getSupportedTaskTypes();

      expect(supportedTypes).toHaveLength(1);
      expect(supportedTypes).toContain('test-task');
    });

    it('should return empty array when no task types registered', () => {
      const emptyFactory = new TaskFactoryImpl(new TaskRegistryImpl());
      const supportedTypes = emptyFactory.getSupportedTaskTypes();

      expect(supportedTypes).toEqual([]);
    });
  });

  describe('isTaskTypeSupported', () => {
    it('should return true for supported task type', () => {
      expect(factory.isTaskTypeSupported('test-task')).toBe(true);
    });

    it('should return false for unsupported task type', () => {
      expect(factory.isTaskTypeSupported('non-existent-task')).toBe(false);
    });
  });

  describe('getTaskTypeInfo', () => {
    it('should return task type info', () => {
      const info = factory.getTaskTypeInfo('test-task');

      expect(info).toBe(mockTaskType);
    });

    it('should return undefined for non-existent task type', () => {
      const info = factory.getTaskTypeInfo('non-existent-task');

      expect(info).toBeUndefined();
    });
  });

  describe('createTasks', () => {
    it('should create multiple tasks', () => {
      const taskSpecs = [
        { type: 'test-task', id: 'task1', inputs: { file: 'file1.ts' } },
        { type: 'test-task', id: 'task2', inputs: { file: 'file2.ts' } }
      ];

      const tasks = factory.createTasks(taskSpecs);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe('task1');
      expect(tasks[1].id).toBe('task2');
    });
  });

  describe('createTaskGenerator', () => {
    it('should create task generator', () => {
      const inputs = { file: 'test.ts' };
      const generator = factory.createTaskGenerator('test-task', inputs);

      const task1 = generator.next();
      const task2 = generator.next();

      expect(task1.id).toMatch(/^test-task-1$/);
      expect(task2.id).toMatch(/^test-task-2$/);
    });

    it('should create batch tasks', () => {
      const inputs = { file: 'test.ts' };
      const generator = factory.createTaskGenerator('test-task', inputs);

      const batch = generator.createBatch(3);

      expect(batch).toHaveLength(3);
      expect(batch[0].id).toMatch(/^test-task-1$/);
      expect(batch[1].id).toMatch(/^test-task-2$/);
      expect(batch[2].id).toMatch(/^test-task-3$/);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      const taskId = 'test-123';
      const inputs = { file: 'test.ts' };

      factory.createTask('test-task', taskId, inputs);
      expect(factory.getCacheSize()).toBe(1);

      factory.clearCache();
      expect(factory.getCacheSize()).toBe(0);
    });

    it('should get cache size', () => {
      expect(factory.getCacheSize()).toBe(0);

      factory.createTask('test-task', 'task1', { file: 'file1.ts' });
      expect(factory.getCacheSize()).toBe(1);

      factory.createTask('test-task', 'task2', { file: 'file2.ts' });
      expect(factory.getCacheSize()).toBe(2);
    });

    it('should remove task from cache', () => {
      const taskId = 'test-123';
      factory.createTask('test-task', taskId, { file: 'test.ts' });

      expect(factory.getCacheSize()).toBe(1);

      factory.removeFromCache(taskId);
      expect(factory.getCacheSize()).toBe(0);
    });

    it('should get cached tasks', () => {
      factory.createTask('test-task', 'task1', { file: 'file1.ts' });
      factory.createTask('test-task', 'task2', { file: 'file2.ts' });

      const cachedTasks = factory.getCachedTasks();
      expect(cachedTasks).toHaveLength(2);
    });
  });

  describe('createLazyTask', () => {
    it('should create lazy task', () => {
      const inputs = { file: 'test.ts' };
      const lazyTask = factory.createLazyTask('test-task', 'lazy-task', inputs);

      expect(lazyTask.isInitialized()).toBe(false);

      const task = lazyTask.get();
      expect(task).toBeDefined();
      expect(lazyTask.isInitialized()).toBe(true);

      // 再次获取应该返回同一个任务
      const task2 = lazyTask.get();
      expect(task2).toBe(task);
    });

    it('should reset lazy task', () => {
      const inputs = { file: 'test.ts' };
      const lazyTask = factory.createLazyTask('test-task', 'lazy-task', inputs);

      const task1 = lazyTask.get();
      lazyTask.reset();
      expect(lazyTask.isInitialized()).toBe(false);

      // 由于TaskFactory有缓存机制，reset后仍可能返回同一实例
      const task2 = lazyTask.get();
      expect(lazyTask.isInitialized()).toBe(true);
    });
  });

  describe('createTaskBuilder', () => {
    it('should build task with builder pattern', () => {
      const builder = factory.createTaskBuilder('test-task')
        .withId('builder-task')
        .withInputs({ file: 'test.ts' })
        .withInput('mode', 'development');

      const task = builder.build();

      expect(task).toBeDefined();
      expect(task.id).toBe('builder-task');
      expect(task.type).toBe('test-task');
    });

    it('should throw error when building without ID', () => {
      const builder = factory.createTaskBuilder('test-task');

      expect(() => builder.build()).toThrow('Task ID is required');
    });
  });

  describe('filterTaskTypes', () => {
    it('should filter task types with predicate', () => {
      const highPriorityTask: TaskType = {
        ...mockTaskType,
        name: 'high-task',
        priority: TaskPriority.HIGH
      };

      registry.register(highPriorityTask);

      const filtered = factory.filterTaskTypes(type => type.priority === TaskPriority.HIGH);

      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toBe(highPriorityTask);
    });
  });

  describe('getTaskTypesByPriority', () => {
    it('should get task types by priority', () => {
      const highPriorityTask: TaskType = {
        ...mockTaskType,
        name: 'high-task',
        priority: TaskPriority.HIGH
      };

      registry.register(highPriorityTask);

      const highTasks = factory.getTaskTypesByPriority(TaskPriority.HIGH);

      expect(highTasks).toHaveLength(1);
      expect(highTasks[0]).toBe(highPriorityTask);
    });
  });
});