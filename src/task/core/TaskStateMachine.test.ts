/**
 * TaskStateMachine单元测试
 * 使用Vitest进行TDD开发
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStatus } from '../types/task';
import { TaskStateMachineImpl } from './TaskStateMachine';

describe('TaskStateMachineImpl', () => {
  let stateMachine: TaskStateMachineImpl;

  beforeEach(() => {
    stateMachine = new TaskStateMachineImpl();
  });

  describe('State Transitions', () => {
    describe('CREATED state', () => {
      it('should allow transition to QUEUED', () => {
        expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.QUEUED)).toBe(true);
      });

      it('should allow transition to RUNNING', () => {
        expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.RUNNING)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.CANCELLED)).toBe(true);
      });

      it('should not allow transition to COMPLETED', () => {
        expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.COMPLETED)).toBe(false);
      });

      it('should not allow transition to FAILED', () => {
        expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.FAILED)).toBe(false);
      });
    });

    describe('QUEUED state', () => {
      it('should allow transition to RUNNING', () => {
        expect(stateMachine.canTransition(TaskStatus.QUEUED, TaskStatus.RUNNING)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(stateMachine.canTransition(TaskStatus.QUEUED, TaskStatus.CANCELLED)).toBe(true);
      });

      it('should not allow transition to COMPLETED', () => {
        expect(stateMachine.canTransition(TaskStatus.QUEUED, TaskStatus.COMPLETED)).toBe(false);
      });
    });

    describe('RUNNING state', () => {
      it('should allow transition to COMPLETED', () => {
        expect(stateMachine.canTransition(TaskStatus.RUNNING, TaskStatus.COMPLETED)).toBe(true);
      });

      it('should allow transition to FAILED', () => {
        expect(stateMachine.canTransition(TaskStatus.RUNNING, TaskStatus.FAILED)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(stateMachine.canTransition(TaskStatus.RUNNING, TaskStatus.CANCELLED)).toBe(true);
      });

      it('should allow transition to PAUSED', () => {
        expect(stateMachine.canTransition(TaskStatus.RUNNING, TaskStatus.PAUSED)).toBe(true);
      });
    });

    describe('PAUSED state', () => {
      it('should allow transition to RUNNING', () => {
        expect(stateMachine.canTransition(TaskStatus.PAUSED, TaskStatus.RUNNING)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(stateMachine.canTransition(TaskStatus.PAUSED, TaskStatus.CANCELLED)).toBe(true);
      });

      it('should not allow transition to COMPLETED', () => {
        expect(stateMachine.canTransition(TaskStatus.PAUSED, TaskStatus.COMPLETED)).toBe(false);
      });
    });

    describe('FAILED state', () => {
      it('should allow transition to QUEUED (retry)', () => {
        expect(stateMachine.canTransition(TaskStatus.FAILED, TaskStatus.QUEUED)).toBe(true);
      });

      it('should not allow transition to RUNNING', () => {
        expect(stateMachine.canTransition(TaskStatus.FAILED, TaskStatus.RUNNING)).toBe(false);
      });
    });

    describe('CANCELLED state', () => {
      it('should allow transition to QUEUED (restart)', () => {
        expect(stateMachine.canTransition(TaskStatus.CANCELLED, TaskStatus.QUEUED)).toBe(true);
      });
    });

    describe('RETRYING state', () => {
      it('should allow transition to QUEUED', () => {
        expect(stateMachine.canTransition(TaskStatus.RETRYING, TaskStatus.QUEUED)).toBe(true);
      });

      it('should allow transition to RUNNING', () => {
        expect(stateMachine.canTransition(TaskStatus.RETRYING, TaskStatus.RUNNING)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(stateMachine.canTransition(TaskStatus.RETRYING, TaskStatus.CANCELLED)).toBe(true);
      });
    });
  });

  describe('getAllowedTransitions', () => {
    it('should return allowed transitions for CREATED state', () => {
      const allowed = stateMachine.getAllowedTransitions(TaskStatus.CREATED);
      expect(allowed).toHaveLength(3);
      expect(allowed).toContain(TaskStatus.QUEUED);
      expect(allowed).toContain(TaskStatus.RUNNING);
      expect(allowed).toContain(TaskStatus.CANCELLED);
    });

    it('should return allowed transitions for RUNNING state', () => {
      const allowed = stateMachine.getAllowedTransitions(TaskStatus.RUNNING);
      expect(allowed).toHaveLength(4);
      expect(allowed).toContain(TaskStatus.COMPLETED);
      expect(allowed).toContain(TaskStatus.FAILED);
      expect(allowed).toContain(TaskStatus.CANCELLED);
      expect(allowed).toContain(TaskStatus.PAUSED);
    });

    it('should return empty array for unknown state', () => {
      const allowed = stateMachine.getAllowedTransitions('UNKNOWN_STATE' as TaskStatus);
      expect(allowed).toEqual([]);
    });
  });

  describe('Custom Transitions', () => {
    it('should allow adding custom transitions', () => {
      stateMachine.addTransition(TaskStatus.COMPLETED, TaskStatus.QUEUED);

      expect(stateMachine.canTransition(TaskStatus.COMPLETED, TaskStatus.QUEUED)).toBe(true);
    });

    it('should allow removing transitions', () => {
      stateMachine.removeTransition(TaskStatus.CREATED, TaskStatus.QUEUED);

      expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.QUEUED)).toBe(false);
    });
  });

  describe('State Information', () => {
    it('should return all states', () => {
      const allStates = stateMachine.getAllStates();
      expect(allStates).toHaveLength(8);
      expect(allStates).toContain(TaskStatus.CREATED);
      expect(allStates).toContain(TaskStatus.RUNNING);
      expect(allStates).toContain(TaskStatus.COMPLETED);
      expect(allStates).toContain(TaskStatus.FAILED);
    });

    it('should return state graph', () => {
      const graph = stateMachine.getStateGraph();

      expect(graph.has(TaskStatus.CREATED)).toBe(true);
      expect(graph.has(TaskStatus.RUNNING)).toBe(true);

      const createdTransitions = graph.get(TaskStatus.CREATED);
      expect(createdTransitions).toContain(TaskStatus.QUEUED);
      expect(createdTransitions).toContain(TaskStatus.RUNNING);
      expect(createdTransitions).toContain(TaskStatus.CANCELLED);
    });
  });

  describe('Transition Validation', () => {
    it('should validate transition rules', () => {
      // 有效的转换
      expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.RUNNING)).toBe(true);
      expect(stateMachine.canTransition(TaskStatus.RUNNING, TaskStatus.COMPLETED)).toBe(true);
      expect(stateMachine.canTransition(TaskStatus.FAILED, TaskStatus.QUEUED)).toBe(true);

      // 无效的转换
      expect(stateMachine.canTransition(TaskStatus.CREATED, TaskStatus.COMPLETED)).toBe(false);
      expect(stateMachine.canTransition(TaskStatus.COMPLETED, TaskStatus.RUNNING)).toBe(false);
      expect(stateMachine.canTransition(TaskStatus.RUNNING, TaskStatus.CREATED)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid transitions gracefully', async () => {
      // 这里需要一个mock的任务对象
      const mockTask = {
        id: 'test-task',
        status: TaskStatus.CREATED,
        type: 'test',
        priority: 5 as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 由于Task接口是只读的，这里会失败，但我们测试错误处理
      await expect(stateMachine.transition(mockTask as any, TaskStatus.COMPLETED))
        .rejects.toThrow('Invalid state transition from created to completed');
    });
  });
});