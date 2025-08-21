/**
 * 任务管理器核心实现
 * 基于Task系统重构详细设计v2.0
 */

import { TaskManager } from '../types/task';
import { Task } from '../types/task';
import { TaskStatus, TaskPriority } from '../types/task';
import { TaskServiceRegistry } from './ServiceRegistry';
import { TaskStateMachineImpl } from './TaskStateMachine';

export class TaskManagerImpl implements TaskManager {
  private tasks = new Map<string, Task>();
  private taskStates = new Map<string, TaskStatus>();
  private activeTasks = new Map<string, Task>();
  private serviceRegistry: TaskServiceRegistry;
  private stateMachine: TaskStateMachineImpl;

  constructor() {
    this.serviceRegistry = new TaskServiceRegistry();
    this.stateMachine = new TaskStateMachineImpl();
  }

  /**
   * 创建任务
   */
  async createTask(taskType: string, inputs: Record<string, any>): Promise<string> {
    const taskId = this.generateTaskId();

    // 创建任务（这里需要TaskFactory来创建实际的任务实例）
    // 暂时创建mock任务用于测试
    const mockTask: Task = {
      id: taskId,
      type: taskType,
      status: TaskStatus.CREATED,
      priority: TaskPriority.NORMAL,
      createdAt: new Date(),
      updatedAt: new Date(),

      execute: async (context) => {
        // 模拟任务执行
        const startTime = new Date();
        await new Promise(resolve => setTimeout(resolve, 100)); // 模拟异步操作

        return {
          success: true,
          output: `Task ${taskId} executed successfully`,
          metrics: {
            startTime,
            endTime: new Date(),
            duration: 100,
            memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
            cpuUsage: { user: 0, system: 0 },
            ioOperations: 1,
            networkRequests: 0,
            errorCount: 0
          }
        };
      },

      cancel: async (reason?: string) => {
        // 模拟任务取消
      },

      pause: async () => {
        // 模拟任务暂停
      },

      resume: async () => {
        // 模拟任务恢复
      },

      getProgress: () => ({
        completed: 100,
        total: 100,
        message: 'Task completed',
        percentage: 100
      }),

      getMetrics: () => ({
        startTime: new Date(),
        memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
        cpuUsage: { user: 0, system: 0 },
        ioOperations: 0,
        networkRequests: 0,
        errorCount: 0
      })
    };

    this.tasks.set(taskId, mockTask);
    this.taskStates.set(taskId, TaskStatus.CREATED);
    return taskId;
  }

  /**
   * 执行任务
   */
  async executeTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // 检查任务状态
    const currentStatus = this.taskStates.get(taskId);
    if (currentStatus !== TaskStatus.CREATED && currentStatus !== TaskStatus.QUEUED) {
      throw new Error(`Task ${taskId} is not in executable state`);
    }

    // 激活任务
    this.activeTasks.set(taskId, task);

    try {
      // 转换状态到运行中
      this.taskStates.set(taskId, TaskStatus.RUNNING);

      // 创建任务上下文
      const context = {
        inputs: {},
        config: {
          timeout: 30000,
          retryPolicy: { maxRetries: 3, backoffMs: 1000, exponential: false },
          resourceLimits: { maxMemory: 100, maxCpu: 80, maxConcurrent: 10 },
          environment: {}
        },
        services: this.serviceRegistry,
        cancellationToken: {
          isCancellationRequested: false,
          onCancellationRequested: () => {}
        }
      };

      // 执行任务
      const result = await task.execute(context);

      // 转换状态到完成
      this.taskStates.set(taskId, TaskStatus.COMPLETED);

      return result;
    } catch (error) {
      // 转换状态到失败
      this.taskStates.set(taskId, TaskStatus.FAILED);
      throw error;
    } finally {
      // 移除活跃任务
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string, reason?: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    await task.cancel(reason);
    this.taskStates.set(taskId, TaskStatus.CANCELLED);
    this.activeTasks.delete(taskId);
  }

  /**
   * 暂停任务
   */
  async pauseTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const currentStatus = this.taskStates.get(taskId);
    if (currentStatus !== TaskStatus.RUNNING) {
      throw new Error(`Task ${taskId} is not running`);
    }

    await task.pause();
    this.taskStates.set(taskId, TaskStatus.PAUSED);
  }

  /**
   * 恢复任务
   */
  async resumeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} is not paused`);
    }

    const currentStatus = this.taskStates.get(taskId);
    if (currentStatus !== TaskStatus.PAUSED) {
      throw new Error(`Task ${taskId} is not paused`);
    }

    await task.resume();
    this.taskStates.set(taskId, TaskStatus.RUNNING);
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): TaskStatus | undefined {
    return this.taskStates.get(taskId);
  }

  /**
   * 获取活跃任务列表
   */
  getActiveTasks(): string[] {
    return Array.from(this.activeTasks.keys());
  }

  /**
   * 获取任务进度
   */
  getTaskProgress(taskId: string): any {
    const task = this.tasks.get(taskId);
    return task?.getProgress();
  }

  /**
   * 获取任务指标
   */
  getTaskMetrics(taskId: string): any {
    const task = this.tasks.get(taskId);
    return task?.getMetrics();
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 取消所有活跃任务
    for (const [taskId, task] of this.activeTasks) {
      task.cancel('TaskManager disposed').catch(console.error);
    }

    this.activeTasks.clear();
    this.tasks.clear();
    this.taskStates.clear();
    this.serviceRegistry.clear();
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): string[] {
    return Array.from(this.tasks.keys());
  }

  /**
   * 获取任务详情
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}