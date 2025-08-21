/**
 * Task注册表实现
 * 基于Task系统重构详细设计v2.0
 */

import { TaskRegistry, TaskType } from '../types/task';

export class TaskRegistryImpl implements TaskRegistry {
  private taskTypes = new Map<string, TaskType>();
  private taskTypeConfigs = new Map<string, TaskTypeConfig>();

  /**
   * 注册任务类型
   */
  register(taskType: TaskType): void {
    if (this.taskTypes.has(taskType.name)) {
      throw new Error(`Task type ${taskType.name} is already registered`);
    }

    this.taskTypes.set(taskType.name, taskType);
  }

  /**
   * 注销任务类型
   */
  unregister(taskTypeName: string): void {
    if (!this.taskTypes.has(taskTypeName)) {
      throw new Error(`Task type ${taskTypeName} is not registered`);
    }

    this.taskTypes.delete(taskTypeName);
    this.taskTypeConfigs.delete(taskTypeName);
  }

  /**
   * 获取任务类型
   */
  getTaskType(taskTypeName: string): TaskType | undefined {
    return this.taskTypes.get(taskTypeName);
  }

  /**
   * 获取所有任务类型
   */
  getAllTaskTypes(): TaskType[] {
    return Array.from(this.taskTypes.values());
  }

  /**
   * 检查任务类型是否存在
   */
  hasTaskType(taskTypeName: string): boolean {
    return this.taskTypes.has(taskTypeName);
  }

  /**
   * 获取任务类型名称列表
   */
  getTaskTypeNames(): string[] {
    return Array.from(this.taskTypes.keys());
  }

  /**
   * 注册任务类型配置
   */
  registerTaskTypeConfig(taskTypeName: string, config: TaskTypeConfig): void {
    if (!this.hasTaskType(taskTypeName)) {
      throw new Error(`Task type ${taskTypeName} is not registered`);
    }
    this.taskTypeConfigs.set(taskTypeName, config);
  }

  /**
   * 获取任务类型配置
   */
  getTaskTypeConfig(taskTypeName: string): TaskTypeConfig | undefined {
    return this.taskTypeConfigs.get(taskTypeName);
  }

  /**
   * 清除所有任务类型
   */
  clear(): void {
    this.taskTypes.clear();
    this.taskTypeConfigs.clear();
  }

  /**
   * 获取任务类型数量
   */
  size(): number {
    return this.taskTypes.size;
  }

  /**
   * 根据优先级获取任务类型
   */
  getTaskTypesByPriority(priority: number): TaskType[] {
    return this.getAllTaskTypes().filter(type => type.priority === priority);
  }

  /**
   * 根据版本获取任务类型
   */
  getTaskTypesByVersion(version: string): TaskType[] {
    return this.getAllTaskTypes().filter(type => type.version === version);
  }

  /**
   * 查找任务类型
   */
  findTaskTypes(predicate: (taskType: TaskType) => boolean): TaskType[] {
    return this.getAllTaskTypes().filter(predicate);
  }
}

/**
 * 任务类型配置接口
 */
export interface TaskTypeConfig {
  enabled: boolean;
  priority: number;
  settings: Record<string, any>;
  dependencies?: string[];
  tags?: string[];
}