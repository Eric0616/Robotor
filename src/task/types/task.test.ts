/**
 * Task类型定义单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, vi } from 'vitest';
import {
  TaskStatus,
  TaskPriority,
  TaskConfig,
  TaskContext,
  TaskResult,
  TaskProgress,
  TaskMetrics,
  Task,
  TaskType,
  CancellationToken,
  ServiceRegistry,
  PluginContext,
  PluginConfig,
  TaskPlugin,
  TaskRegistry,
  TaskFactory,
  TaskManager,
  TaskScheduler,
  TaskStateMachine,
  TaskMonitor,
  PluginManager
} from './task';

describe('Task Types', () => {
  describe('Enums', () => {
    it('should have all expected TaskStatus values', () => {
      expect(TaskStatus.CREATED).toBe('created');
      expect(TaskStatus.QUEUED).toBe('queued');
      expect(TaskStatus.RUNNING).toBe('running');
      expect(TaskStatus.PAUSED).toBe('paused');
      expect(TaskStatus.COMPLETED).toBe('completed');
      expect(TaskStatus.FAILED).toBe('failed');
      expect(TaskStatus.CANCELLED).toBe('cancelled');
      expect(TaskStatus.RETRYING).toBe('retrying');
    });

    it('should have all expected TaskPriority values', () => {
      expect(TaskPriority.LOW).toBe(1);
      expect(TaskPriority.NORMAL).toBe(5);
      expect(TaskPriority.HIGH).toBe(10);
      expect(TaskPriority.CRITICAL).toBe(15);
    });
  });

  describe('TaskConfig', () => {
    it('should create valid TaskConfig object', () => {
      const config: TaskConfig = {
        timeout: 30000,
        retryPolicy: {
          maxRetries: 3,
          backoffMs: 1000,
          exponential: true
        },
        resourceLimits: {
          maxMemory: 100 * 1024 * 1024, // 100MB
          maxCpu: 80,
          maxConcurrent: 10
        },
        environment: {
          NODE_ENV: 'development',
          DEBUG: 'true'
        }
      };

      expect(config.timeout).toBe(30000);
      expect(config.retryPolicy.maxRetries).toBe(3);
      expect(config.resourceLimits.maxMemory).toBe(100 * 1024 * 1024);
      expect(config.environment.NODE_ENV).toBe('development');
    });
  });

  describe('TaskContext', () => {
    it('should create valid TaskContext object', () => {
      const mockServices: ServiceRegistry = {
        getService: vi.fn(),
        registerService: vi.fn(),
        unregisterService: vi.fn()
      };

      const mockCancellationToken: CancellationToken = {
        isCancellationRequested: false,
        onCancellationRequested: vi.fn()
      };

      const context: TaskContext = {
        inputs: { file: 'test.ts' },
        config: {
          timeout: 30000,
          retryPolicy: { maxRetries: 3, backoffMs: 1000, exponential: false },
          resourceLimits: { maxMemory: 100, maxCpu: 80, maxConcurrent: 10 },
          environment: {}
        },
        services: mockServices,
        cancellationToken: mockCancellationToken
      };

      expect(context.inputs.file).toBe('test.ts');
      expect(context.config.timeout).toBe(30000);
      expect(context.services).toBe(mockServices);
      expect(context.cancellationToken).toBe(mockCancellationToken);
    });
  });

  describe('TaskResult', () => {
    it('should create successful TaskResult', () => {
      const result: TaskResult = {
        success: true,
        output: 'Task completed successfully',
        metrics: {
          startTime: new Date(),
          memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 },
          cpuUsage: { user: 0, system: 0 },
          ioOperations: 0,
          networkRequests: 0,
          errorCount: 0
        }
      };

      expect(result.success).toBe(true);
      expect(result.output).toBe('Task completed successfully');
      expect(result.error).toBeUndefined();
      expect(result.metrics.startTime).toBeInstanceOf(Date);
    });

    it('should create failed TaskResult', () => {
      const error = new Error('Task failed');
      const result: TaskResult = {
        success: false,
        output: null,
        error: error,
        metrics: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          memoryUsage: { rss: 1000, heapTotal: 2000, heapUsed: 1500, external: 0 },
          cpuUsage: { user: 100, system: 50 },
          ioOperations: 5,
          networkRequests: 2,
          errorCount: 1
        }
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.metrics.duration).toBe(1000);
      expect(result.metrics.errorCount).toBe(1);
    });
  });

  describe('TaskProgress', () => {
    it('should create valid TaskProgress', () => {
      const progress: TaskProgress = {
        completed: 75,
        total: 100,
        message: 'Processing files...',
        percentage: 75
      };

      expect(progress.completed).toBe(75);
      expect(progress.total).toBe(100);
      expect(progress.message).toBe('Processing files...');
      expect(progress.percentage).toBe(75);
    });
  });

  describe('TaskMetrics', () => {
    it('should create valid TaskMetrics', () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 1000);

      const metrics: TaskMetrics = {
        startTime,
        endTime,
        duration: 1000,
        memoryUsage: {
          rss: 1024 * 1024,
          heapTotal: 2048 * 1024,
          heapUsed: 1536 * 1024,
          external: 512 * 1024
        },
        cpuUsage: {
          user: 150,
          system: 50
        },
        ioOperations: 10,
        networkRequests: 3,
        errorCount: 0
      };

      expect(metrics.startTime).toBe(startTime);
      expect(metrics.endTime).toBe(endTime);
      expect(metrics.duration).toBe(1000);
      expect(metrics.memoryUsage.rss).toBe(1024 * 1024);
      expect(metrics.cpuUsage.user).toBe(150);
      expect(metrics.ioOperations).toBe(10);
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe('CancellationToken', () => {
    it('should create valid CancellationToken', () => {
      const token: CancellationToken = {
        isCancellationRequested: false,
        onCancellationRequested: vi.fn()
      };

      expect(token.isCancellationRequested).toBe(false);
      expect(typeof token.onCancellationRequested).toBe('function');
    });
  });

  describe('ServiceRegistry', () => {
    it('should create valid ServiceRegistry', () => {
      const registry: ServiceRegistry = {
        getService: vi.fn(),
        registerService: vi.fn(),
        unregisterService: vi.fn()
      };

      expect(typeof registry.getService).toBe('function');
      expect(typeof registry.registerService).toBe('function');
      expect(typeof registry.unregisterService).toBe('function');
    });
  });

  describe('PluginConfig', () => {
    it('should create valid PluginConfig', () => {
      const config: PluginConfig = {
        enabled: true,
        priority: 10,
        settings: {
          timeout: 5000,
          retries: 3
        }
      };

      expect(config.enabled).toBe(true);
      expect(config.priority).toBe(10);
      expect(config.settings.timeout).toBe(5000);
    });
  });
});