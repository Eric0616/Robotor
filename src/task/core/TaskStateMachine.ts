/**
 * 任务状态机实现
 * 基于Task系统重构详细设计v2.0
 */

import { TaskStatus, TaskStateMachine } from '../types/task';
import { Task } from '../types/task';

export class TaskStateMachineImpl implements TaskStateMachine {
  private transitions: Map<TaskStatus, Set<TaskStatus>>;

  constructor() {
    this.transitions = new Map();

    // 定义状态转换规则
    this.defineTransitions();
  }

  /**
   * 检查状态转换是否允许
   */
  canTransition(from: TaskStatus, to: TaskStatus): boolean {
    const allowedStates = this.transitions.get(from);
    return allowedStates ? allowedStates.has(to) : false;
  }

  /**
   * 执行状态转换
   */
  async transition(task: Task, to: TaskStatus): Promise<void> {
    const from = task.status;

    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid state transition from ${from} to ${to}`);
    }

    // 这里可以添加状态转换的业务逻辑
    // 比如：触发状态变化事件、执行清理操作等

    // 更新任务状态（注意：这里的Task接口是只读的，实际实现需要可变的任务对象）
    console.log(`Task ${task.id} transitioned from ${from} to ${to}`);

    // 在实际实现中，这里会更新任务对象的status属性
    // task.status = to;
    // task.updatedAt = new Date();
  }

  /**
   * 获取允许的转换状态
   */
  getAllowedTransitions(status: TaskStatus): TaskStatus[] {
    const allowedStates = this.transitions.get(status);
    return allowedStates ? Array.from(allowedStates) : [];
  }

  /**
   * 定义状态转换规则
   */
  private defineTransitions(): void {
    // CREATED -> QUEUED, RUNNING, CANCELLED
    this.transitions.set(TaskStatus.CREATED, new Set([
      TaskStatus.QUEUED,
      TaskStatus.RUNNING,
      TaskStatus.CANCELLED
    ]));

    // QUEUED -> RUNNING, CANCELLED
    this.transitions.set(TaskStatus.QUEUED, new Set([
      TaskStatus.RUNNING,
      TaskStatus.CANCELLED
    ]));

    // RUNNING -> COMPLETED, FAILED, CANCELLED, PAUSED
    this.transitions.set(TaskStatus.RUNNING, new Set([
      TaskStatus.COMPLETED,
      TaskStatus.FAILED,
      TaskStatus.CANCELLED,
      TaskStatus.PAUSED
    ]));

    // PAUSED -> RUNNING, CANCELLED
    this.transitions.set(TaskStatus.PAUSED, new Set([
      TaskStatus.RUNNING,
      TaskStatus.CANCELLED
    ]));

    // FAILED -> QUEUED (重试)
    this.transitions.set(TaskStatus.FAILED, new Set([
      TaskStatus.QUEUED
    ]));

    // CANCELLED -> QUEUED (重新开始)
    this.transitions.set(TaskStatus.CANCELLED, new Set([
      TaskStatus.QUEUED
    ]));

    // RETRYING -> QUEUED, RUNNING, CANCELLED
    this.transitions.set(TaskStatus.RETRYING, new Set([
      TaskStatus.QUEUED,
      TaskStatus.RUNNING,
      TaskStatus.CANCELLED
    ]));
  }

  /**
   * 添加自定义状态转换
   */
  addTransition(from: TaskStatus, to: TaskStatus): void {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Set());
    }
    this.transitions.get(from)!.add(to);
  }

  /**
   * 移除状态转换
   */
  removeTransition(from: TaskStatus, to: TaskStatus): void {
    const allowedStates = this.transitions.get(from);
    if (allowedStates) {
      allowedStates.delete(to);
    }
  }

  /**
   * 获取所有状态
   */
  getAllStates(): TaskStatus[] {
    return Object.values(TaskStatus);
  }

  /**
   * 获取状态图
   */
  getStateGraph(): Map<TaskStatus, TaskStatus[]> {
    const graph = new Map<TaskStatus, TaskStatus[]>();
    for (const [from, toSet] of this.transitions) {
      graph.set(from, Array.from(toSet));
    }
    return graph;
  }
}