/**
 * TaskFactory工厂模式实现
 * 基于Task系统重构详细设计v2.0
 */

import { TaskFactory, Task, TaskType } from '../types/task';
import { TaskRegistry } from '../types/task';

export class TaskFactoryImpl implements TaskFactory {
  private registry: TaskRegistry;
  private taskCache = new Map<string, Task>();

  constructor(registry: TaskRegistry) {
    this.registry = registry;
  }

  /**
   * 创建任务实例
   */
  createTask(taskTypeName: string, id: string, inputs: Record<string, any>): Task {
    const taskType = this.registry.getTaskType(taskTypeName);

    if (!taskType) {
      throw new Error(`Task type ${taskTypeName} not found`);
    }

    // 检查缓存
    const cacheKey = `${taskTypeName}:${id}`;
    const cachedTask = this.taskCache.get(cacheKey);

    if (cachedTask) {
      return cachedTask;
    }

    // 创建新任务
    const task = taskType.createTask(id, inputs);

    // 缓存任务实例（可选）
    this.taskCache.set(cacheKey, task);

    return task;
  }

  /**
   * 获取支持的任务类型列表
   */
  getSupportedTaskTypes(): string[] {
    return this.registry.getAllTaskTypes().map(type => type.name);
  }

  /**
   * 检查是否支持任务类型
   */
  isTaskTypeSupported(taskTypeName: string): boolean {
    return this.registry.hasTaskType(taskTypeName);
  }

  /**
   * 获取任务类型信息
   */
  getTaskTypeInfo(taskTypeName: string): TaskType | undefined {
    return this.registry.getTaskType(taskTypeName);
  }

  /**
   * 批量创建任务
   */
  createTasks(taskSpecs: Array<{
    type: string;
    id: string;
    inputs: Record<string, any>
  }>): Task[] {
    return taskSpecs.map(spec => this.createTask(spec.type, spec.id, spec.inputs));
  }

  /**
   * 创建任务生成器
   */
  createTaskGenerator(taskTypeName: string, inputs: Record<string, any>) {
    let counter = 0;

    return {
      next: (): Task => {
        const taskId = `${taskTypeName}-${++counter}`;
        return this.createTask(taskTypeName, taskId, inputs);
      },

      createBatch: (count: number): Task[] => {
        return Array.from({ length: count }, () => this.createTask(taskTypeName, `${taskTypeName}-${++counter}`, inputs));
      }
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.taskCache.clear();
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.taskCache.size;
  }

  /**
   * 移除缓存的任务
   */
  removeFromCache(taskId: string): void {
    // 由于缓存key包含taskType，需要遍历查找
    for (const [key, task] of this.taskCache) {
      if (task.id === taskId) {
        this.taskCache.delete(key);
        break;
      }
    }
  }

  /**
   * 获取缓存的任务
   */
  getCachedTasks(): Task[] {
    return Array.from(this.taskCache.values());
  }

  /**
   * 根据条件过滤任务类型
   */
  filterTaskTypes(predicate: (taskType: TaskType) => boolean): TaskType[] {
    return this.registry.getAllTaskTypes().filter(predicate);
  }

  /**
   * 按优先级获取任务类型
   */
  getTaskTypesByPriority(priority: number): TaskType[] {
    return this.registry.getTaskTypesByPriority(priority);
  }

  /**
   * 创建延迟初始化的任务
   */
  createLazyTask(taskTypeName: string, id: string, inputs: Record<string, any>) {
    let task: Task | null = null;

    return {
      get: (): Task => {
        if (!task) {
          task = this.createTask(taskTypeName, id, inputs);
        }
        return task;
      },

      isInitialized: (): boolean => task !== null,

      reset: (): void => {
        task = null;
      }
    };
  }

  /**
   * 创建任务构建器
   */
  createTaskBuilder(taskTypeName: string) {
    let id: string;
    let inputs: Record<string, any> = {};
    let priority: number;

    const builder = {
      withId: (taskId: string) => {
        id = taskId;
        return builder;
      },

      withInputs: (taskInputs: Record<string, any>) => {
        inputs = { ...inputs, ...taskInputs };
        return builder;
      },

      withInput: (key: string, value: any) => {
        inputs[key] = value;
        return builder;
      },

      withPriority: (taskPriority: number) => {
        priority = taskPriority;
        return builder;
      },

      build: (): Task => {
        if (!id) {
          throw new Error('Task ID is required');
        }

        const task = this.createTask(taskTypeName, id, inputs);

        // 如果设置了优先级，这里可以调整任务的优先级
        // 注意：Task接口是只读的，实际实现需要可变的任务对象
        // task.priority = priority;

        return task;
      }
    };

    return builder;
  }
}