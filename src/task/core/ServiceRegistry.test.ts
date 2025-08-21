/**
 * ServiceRegistry单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskServiceRegistry, ServiceConfig } from './ServiceRegistry';

describe('TaskServiceRegistry', () => {
  let registry: TaskServiceRegistry;

  beforeEach(() => {
    registry = new TaskServiceRegistry();
  });

  describe('registerService', () => {
    it('should register a service successfully', () => {
      const serviceId = 'test-service';
      const service = { name: 'TestService' };

      registry.registerService(serviceId, service);

      expect(registry.hasService(serviceId)).toBe(true);
      expect(registry.getService(serviceId)).toBe(service);
    });

    it('should throw error when registering duplicate service', () => {
      const serviceId = 'test-service';
      const service1 = { name: 'TestService1' };
      const service2 = { name: 'TestService2' };

      registry.registerService(serviceId, service1);

      expect(() => registry.registerService(serviceId, service2))
        .toThrow(`Service ${serviceId} is already registered`);
    });
  });

  describe('getService', () => {
    it('should retrieve a registered service', () => {
      const serviceId = 'test-service';
      const service = { name: 'TestService' };

      registry.registerService(serviceId, service);
      const retrievedService = registry.getService(serviceId);

      expect(retrievedService).toBe(service);
    });

    it('should throw error when getting non-existent service', () => {
      const serviceId = 'non-existent-service';

      expect(() => registry.getService(serviceId))
        .toThrow(`Service ${serviceId} not found`);
    });
  });

  describe('unregisterService', () => {
    it('should unregister a service successfully', () => {
      const serviceId = 'test-service';
      const service = { name: 'TestService' };

      registry.registerService(serviceId, service);
      expect(registry.hasService(serviceId)).toBe(true);

      registry.unregisterService(serviceId);
      expect(registry.hasService(serviceId)).toBe(false);
    });

    it('should throw error when unregistering non-existent service', () => {
      const serviceId = 'non-existent-service';

      expect(() => registry.unregisterService(serviceId))
        .toThrow(`Service ${serviceId} is not registered`);
    });
  });

  describe('hasService', () => {
    it('should return true for registered service', () => {
      const serviceId = 'test-service';
      const service = { name: 'TestService' };

      registry.registerService(serviceId, service);

      expect(registry.hasService(serviceId)).toBe(true);
    });

    it('should return false for non-registered service', () => {
      const serviceId = 'non-existent-service';

      expect(registry.hasService(serviceId)).toBe(false);
    });
  });

  describe('getServiceIds', () => {
    it('should return all registered service IDs', () => {
      const services = [
        { id: 'service1', instance: { name: 'Service1' } },
        { id: 'service2', instance: { name: 'Service2' } },
        { id: 'service3', instance: { name: 'Service3' } }
      ];

      services.forEach(({ id, instance }) => {
        registry.registerService(id, instance);
      });

      const serviceIds = registry.getServiceIds();

      expect(serviceIds).toHaveLength(3);
      expect(serviceIds).toContain('service1');
      expect(serviceIds).toContain('service2');
      expect(serviceIds).toContain('service3');
    });

    it('should return empty array when no services registered', () => {
      const serviceIds = registry.getServiceIds();

      expect(serviceIds).toEqual([]);
    });
  });

  describe('Service Configuration', () => {
    it('should register and retrieve service config', () => {
      const serviceId = 'test-service';
      const service = { name: 'TestService' };
      const config: ServiceConfig = {
        singleton: true,
        dependencies: ['dep1', 'dep2'],
        tags: ['important', 'core']
      };

      registry.registerService(serviceId, service);
      registry.registerServiceConfig(serviceId, config);

      const retrievedConfig = registry.getServiceConfig(serviceId);

      expect(retrievedConfig).toEqual(config);
    });

    it('should return undefined for non-existent service config', () => {
      const serviceId = 'non-existent-service';

      const config = registry.getServiceConfig(serviceId);

      expect(config).toBeUndefined();
    });
  });

  describe('Lifecycle Management', () => {
    it('should clear all services', () => {
      const services = [
        { id: 'service1', instance: { name: 'Service1' } },
        { id: 'service2', instance: { name: 'Service2' } }
      ];

      services.forEach(({ id, instance }) => {
        registry.registerService(id, instance);
      });

      expect(registry.size()).toBe(2);

      registry.clear();

      expect(registry.size()).toBe(0);
      expect(registry.getServiceIds()).toEqual([]);
    });

    it('should track service count correctly', () => {
      expect(registry.size()).toBe(0);

      registry.registerService('service1', { name: 'Service1' });
      expect(registry.size()).toBe(1);

      registry.registerService('service2', { name: 'Service2' });
      expect(registry.size()).toBe(2);

      registry.unregisterService('service1');
      expect(registry.size()).toBe(1);

      registry.clear();
      expect(registry.size()).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle service registration with complex objects', () => {
      const serviceId = 'complex-service';
      const complexService = {
        name: 'ComplexService',
        dependencies: ['dep1', 'dep2'],
        methods: {
          execute: vi.fn(),
          cancel: vi.fn()
        }
      };

      registry.registerService(serviceId, complexService);
      const retrievedService = registry.getService<typeof complexService>(serviceId);

      expect(retrievedService).toBe(complexService);
      expect(retrievedService.methods.execute).toBeDefined();
    });

    it('should handle service ID with special characters', () => {
      const serviceId = 'test-service-with_special.chars';
      const service = { name: 'SpecialService' };

      registry.registerService(serviceId, service);

      expect(registry.hasService(serviceId)).toBe(true);
      expect(registry.getService(serviceId)).toBe(service);
    });
  });
});