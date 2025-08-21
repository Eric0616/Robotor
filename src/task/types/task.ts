/**
 * Task系统核心类型定义
 * 基于Task系统重构详细设计v2.0
 */

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  CREATED = 'created',
  QUEUED = 'queued',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15
}

/**
 * 任务配置接口
 */
export interface TaskConfig {
  timeout: number;
  retryPolicy: RetryPolicy;
  resourceLimits: ResourceLimits;
  environment: Record<string, any>;
}

/**
 * 重试策略接口
 */
export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  exponential: boolean;
}

/**
 * 资源限制接口
 */
export interface ResourceLimits {
  maxMemory: number;
  maxCpu: number;
  maxConcurrent: number;
}

/**
 * 任务上下文接口
 */
export interface TaskContext {
  inputs: Record<string, any>;
  config: TaskConfig;
  services: ServiceRegistry;
  cancellationToken: CancellationToken;
}

/**
 * 任务结果接口
 */
export interface TaskResult {
  success: boolean;
  output: any;
  error?: Error;
  metrics: TaskMetrics;
}

/**
 * 任务进度接口
 */
export interface TaskProgress {
  completed: number;
  total: number;
  message?: string;
  percentage: number;
}

/**
 * 任务指标接口
 */
export interface TaskMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  memoryUsage: MemoryUsage;
  cpuUsage: CPUUsage;
  ioOperations: number;
  networkRequests: number;
  errorCount: number;
}

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

/**
 * CPU使用情况
 */
export interface CPUUsage {
  user: number;
  system: number;
}

/**
 * 任务接口
 */
export interface Task {
  readonly id: string;
  readonly type: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  execute(context: TaskContext): Promise<TaskResult>;
  cancel(reason?: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  getProgress(): TaskProgress;
  getMetrics(): TaskMetrics;
}

/**
 * 任务类型定义
 */
export interface TaskType {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly priority: TaskPriority;
  readonly config: TaskConfig;

  createTask(id: string, inputs: Record<string, any>): Task;
}

/**
 * 取消令牌接口
 */
export interface CancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested(callback: () => void): void;
}

/**
 * 服务注册表接口
 */
export interface ServiceRegistry {
  getService<T>(serviceId: string): T;
  registerService<T>(serviceId: string, service: T): void;
  unregisterService(serviceId: string): void;
}

/**
 * 插件上下文接口
 */
export interface PluginContext {
  registry: TaskRegistry;
  services: ServiceRegistry;
  config: PluginConfig;
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
 * 插件接口
 */
export interface TaskPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;

  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
  getTaskTypes(): TaskType[];
}

/**
 * 任务注册表接口
 */
export interface TaskRegistry {
  register(taskType: TaskType): void;
  unregister(taskTypeName: string): void;
  getTaskType(taskTypeName: string): TaskType | undefined;
  getAllTaskTypes(): TaskType[];
  hasTaskType(taskTypeName: string): boolean;
}

/**
 * 任务工厂接口
 */
export interface TaskFactory {
  createTask(taskTypeName: string, id: string, inputs: Record<string, any>): Task;
  getSupportedTaskTypes(): string[];
}

/**
 * 任务管理器接口
 */
export interface TaskManager {
  createTask(taskType: string, inputs: Record<string, any>): Promise<string>;
  executeTask(taskId: string): Promise<TaskResult>;
  cancelTask(taskId: string, reason?: string): Promise<void>;
  pauseTask(taskId: string): Promise<void>;
  resumeTask(taskId: string): Promise<void>;
  getTaskStatus(taskId: string): TaskStatus | undefined;
  getActiveTasks(): string[];
  getTaskProgress(taskId: string): TaskProgress | undefined;
  getTaskMetrics(taskId: string): TaskMetrics | undefined;
  dispose(): void;
}

/**
 * 任务调度器接口
 */
export interface TaskScheduler {
  schedule(task: Task): Promise<TaskResult>;
  getQueueSize(): number;
  getRunningCount(): number;
  setMaxConcurrent(max: number): void;
}

/**
 * 任务状态机接口
 */
export interface TaskStateMachine {
  canTransition(from: TaskStatus, to: TaskStatus): boolean;
  transition(task: Task, to: TaskStatus): Promise<void>;
  getAllowedTransitions(status: TaskStatus): TaskStatus[];
}

/**
 * 任务监控器接口
 */
export interface TaskMonitor {
  startMonitoring(taskId: string): void;
  updateMetrics(taskId: string, updates: Partial<TaskMetrics>): void;
  endMonitoring(taskId: string): TaskMetrics | undefined;
  getMetrics(taskId: string): TaskMetrics | undefined;
}

/**
 * 插件管理器接口
 */
export interface PluginManager {
  loadPlugin(pluginPath: string): Promise<void>;
  unloadPlugin(pluginName: string): Promise<void>;
  getLoadedPlugins(): string[];
  getPlugin(pluginName: string): TaskPlugin | undefined;
}