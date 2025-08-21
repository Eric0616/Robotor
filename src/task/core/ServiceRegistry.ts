/**
 * 服务注册表实现
 * 基于Task系统重构详细设计v2.0
 */

import { ServiceRegistry } from '../types/task';

export class TaskServiceRegistry implements ServiceRegistry {
  private services = new Map<string, any>();
  private serviceConfigs = new Map<string, ServiceConfig>();

  /**
   * 获取服务
   */
  getService<T>(serviceId: string): T {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }
    return service;
  }

  /**
   * 注册服务
   */
  registerService<T>(serviceId: string, service: T): void {
    if (this.services.has(serviceId)) {
      throw new Error(`Service ${serviceId} is already registered`);
    }
    this.services.set(serviceId, service);
  }

  /**
   * 注销服务
   */
  unregisterService(serviceId: string): void {
    if (!this.services.has(serviceId)) {
      throw new Error(`Service ${serviceId} is not registered`);
    }
    this.services.delete(serviceId);
    this.serviceConfigs.delete(serviceId);
  }

  /**
   * 检查服务是否存在
   */
  hasService(serviceId: string): boolean {
    return this.services.has(serviceId);
  }

  /**
   * 获取所有已注册的服务ID
   */
  getServiceIds(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * 注册服务配置
   */
  registerServiceConfig(serviceId: string, config: ServiceConfig): void {
    this.serviceConfigs.set(serviceId, config);
  }

  /**
   * 获取服务配置
   */
  getServiceConfig(serviceId: string): ServiceConfig | undefined {
    return this.serviceConfigs.get(serviceId);
  }

  /**
   * 清理所有服务
   */
  clear(): void {
    this.services.clear();
    this.serviceConfigs.clear();
  }

  /**
   * 获取服务数量
   */
  size(): number {
    return this.services.size;
  }
}

/**
 * 服务配置接口
 */
export interface ServiceConfig {
  singleton?: boolean;
  dependencies?: string[];
  tags?: string[];
}

/**
 * 服务工厂接口
 */
export interface ServiceFactory<T> {
  create(): T;
  destroy?(service: T): void;
}