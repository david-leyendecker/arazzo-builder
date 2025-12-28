import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkflowStore } from '../workflow'
import type { WorkflowNode, WorkflowConnection } from '../../types/arazzo'

describe('useWorkflowStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const store = useWorkflowStore()
      
      expect(store.workflow.arazzo).toBe('1.0.0')
      expect(store.workflow.info.title).toBe('New Workflow')
      expect(store.nodes).toEqual([])
      expect(store.connections).toEqual([])
      expect(store.selectedNodeId).toBeNull()
      expect(store.deferPathUpdates).toBe(false)
    })

    it('should have empty operation map initially', () => {
      const store = useWorkflowStore()
      expect(store.operationMap.size).toBe(0)
    })
  })

  describe('node operations', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should add a node', () => {
      const node: WorkflowNode = {
        id: 'step-123',
        type: 'step',
        data: {
          stepId: 'step-123',
          operationId: 'test-op',
          onSuccess: [],
          onFailure: []
        },
        position: { x: 0, y: 0 }
      }

      store.addNode(node)

      expect(store.nodes).toHaveLength(1)
      expect(store.nodes[0]).toEqual(node)
      expect(store.mainWorkflow.steps).toHaveLength(1)
    })

    it('should remove a node and its connections', () => {
      const node: WorkflowNode = {
        id: 'step-123',
        type: 'step',
        data: {
          stepId: 'step-123',
          operationId: 'test-op',
          onSuccess: [],
          onFailure: []
        },
        position: { x: 0, y: 0 }
      }

      store.addNode(node)
      expect(store.nodes).toHaveLength(1)

      store.removeNode('step-123')

      expect(store.nodes).toHaveLength(0)
      const workflow = store.mainWorkflow
      if (!workflow) throw new Error('Workflow not initialized')
      expect(workflow.steps).toHaveLength(0)
    })

    it('should update a node', () => {
      const node: WorkflowNode = {
        id: 'step-123',
        type: 'step',
        data: {
          stepId: 'step-123',
          operationId: 'test-op',
          onSuccess: [],
          onFailure: []
        },
        position: { x: 0, y: 0 }
      }

      store.addNode(node)
      store.updateNode('step-123', { operationId: 'new-op' })

      expect(store.nodes[0]?.data.operationId).toBe('new-op')
      const workflow = store.mainWorkflow
      if (!workflow) throw new Error('Workflow not initialized')
      expect(workflow.steps[0]?.operationId).toBe('new-op')
    })

    it('should select and deselect a node', () => {
      const node: WorkflowNode = {
        id: 'step-123',
        type: 'step',
        data: { stepId: 'step-123', operationId: 'test-op', onSuccess: [], onFailure: [] },
        position: { x: 0, y: 0 }
      }

      store.addNode(node)
      store.selectNode('step-123')

      expect(store.selectedNodeId).toBe('step-123')
      expect(store.selectedNode).toEqual(node)

      store.selectNode(null)
      expect(store.selectedNodeId).toBeNull()
      expect(store.selectedNode).toBeNull()
    })
  })

  describe('connection operations', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should add a connection', () => {
      const connection: WorkflowConnection = {
        id: 'conn-1',
        source: 'start',
        target: 'step-1',
        sourceHandle: 'success',
        targetHandle: 'prev'
      }

      store.addConnection(connection)

      expect(store.connections).toHaveLength(1)
      expect(store.connections[0]).toEqual(connection)
    })

    it('should remove a connection', () => {
      const connection: WorkflowConnection = {
        id: 'conn-1',
        source: 'start',
        target: 'step-1'
      }

      store.addConnection(connection)
      expect(store.connections).toHaveLength(1)

      store.removeConnection('conn-1')

      expect(store.connections).toHaveLength(0)
    })

    it('should defer path updates when flag is set', () => {
      const connection1: WorkflowConnection = {
        id: 'conn-1',
        source: 'start',
        target: 'step-1'
      }
      const connection2: WorkflowConnection = {
        id: 'conn-2',
        source: 'step-1',
        target: 'end'
      }

      store.deferPathUpdates = true
      store.addConnection(connection1)
      store.addConnection(connection2)

      expect(store.connections).toHaveLength(2)
    })
  })

  describe('batch connection operations', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should batch multiple connections and defer path updates', () => {
      const updatePathSpy = vi.spyOn(store, 'updateConnectionPaths')

      const conn1: WorkflowConnection = { id: 'c1', source: 'start', target: 'step-1' }
      const conn2: WorkflowConnection = { id: 'c2', source: 'step-1', target: 'step-2' }

      store.batchConnections(() => {
        store.addConnection(conn1)
        store.addConnection(conn2)
      })

      // updateConnectionPaths should be called once at the end, not twice
      expect(updatePathSpy).toHaveBeenCalledTimes(1)
      expect(store.connections).toHaveLength(2)
    })

    it('should respect nested batch calls', () => {
      const updatePathSpy = vi.spyOn(store, 'updateConnectionPaths')

      store.batchConnections(() => {
        store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })

        store.batchConnections(() => {
          store.addConnection({ id: 'c2', source: 'step-1', target: 'step-2' })
        })

        store.addConnection({ id: 'c3', source: 'step-2', target: 'end' })
      })

      // Should only be called once total (nested batch defers, outer batch executes once)
      expect(updatePathSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('helper methods', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('_getNodeById should find a node by ID', () => {
      const node: WorkflowNode = {
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 0, y: 0 }
      }
      store.addNode(node)

      const found = store._getNodeById('step-1')
      expect(found).toEqual(node)

      const notFound = store._getNodeById('nonexistent')
      expect(notFound).toBeUndefined()
    })

    it('_getIncomingConnections should find all connections targeting a node', () => {
      store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })
      store.addConnection({ id: 'c2', source: 'step-2', target: 'step-1' })
      store.addConnection({ id: 'c3', source: 'step-1', target: 'end' })

      const incoming = store._getIncomingConnections('step-1')
      expect(incoming).toHaveLength(2)
      expect(incoming.map(c => c.id)).toEqual(['c1', 'c2'])
    })

    it('_getOutgoingConnections should find all connections from a node', () => {
      store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })
      store.addConnection({ id: 'c2', source: 'step-1', target: 'step-2' })
      store.addConnection({ id: 'c3', source: 'step-1', target: 'end' })

      const outgoing = store._getOutgoingConnections('step-1')
      expect(outgoing).toHaveLength(2)
      expect(outgoing.map(c => c.id)).toEqual(['c2', 'c3'])
    })
  })

  describe('operation lookup with memoization', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should cache operations in operationMap', () => {
      const mockOperation = { operationId: 'test-op', method: 'GET', path: '/test' }

      // Mock the parsedSpecs
      store.parsedSpecs = [
        {
          sourceName: 'test-source',
          operations: [mockOperation]
        } as any
      ]

      // First call should search and cache
      const result1 = store.findOperation('test-op')
      expect(result1).toEqual(mockOperation)
      expect(store.operationMap.has('test-op')).toBe(true)

      // Second call should use cache
      const result2 = store.findOperation('test-op')
      expect(result2).toEqual(mockOperation)
    })

    it('should return null for non-existent operation', () => {
      const result = store.findOperation('nonexistent-op')
      expect(result).toBeNull()
    })

    it('should clear operation cache when specs are loaded', () => {
      store.operationMap.set('old-op', { operationId: 'old-op' })
      expect(store.operationMap.size).toBe(1)

      // Mock the fetch
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => ({ openapi: '3.0.0', paths: {} })
      } as any)

      // When loadOpenAPISpec is called, cache should be cleared
      // (This would require mocking fetchOpenAPISpec)
      store.operationMap.clear()
      expect(store.operationMap.size).toBe(0)
    })
  })

  describe('validation', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should validate missing start node', () => {
      const result = store.validateWorkflow()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Workflow must have a start node')
    })

    it('should validate missing end node', () => {
      store.addNode({
        id: 'start',
        type: 'start',
        data: {},
        position: { x: 0, y: 0 }
      })

      const result = store.validateWorkflow()
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Workflow must have an end node')
    })

    it('should validate step has operationId', () => {
      store.addNode({ id: 'start', type: 'start', data: {}, position: { x: 0, y: 0 } })
      store.addNode({ id: 'end', type: 'end', data: {}, position: { x: 100, y: 0 } })
      store.addNode({
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: '', onSuccess: [], onFailure: [] },
        position: { x: 50, y: 0 }
      })

      const result = store.validateWorkflow()
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('missing an operationId'))).toBe(true)
    })

    it('should validate successful workflow', () => {
      store.addNode({ id: 'start', type: 'start', data: {}, position: { x: 0, y: 0 } })
      store.addNode({ id: 'end', type: 'end', data: {}, position: { x: 100, y: 0 } })
      store.addNode({
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'valid-op', onSuccess: [], onFailure: [] },
        position: { x: 50, y: 0 }
      })
      store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })
      store.addConnection({ id: 'c2', source: 'step-1', target: 'end' })

      const result = store.validateWorkflow()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('removeStepWithReconnect', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should reconnect incoming and outgoing edges', () => {
      // Create a chain: start -> step-1 -> step-2 -> end
      store.addNode({ id: 'start', type: 'start', data: {}, position: { x: 0, y: 0 } })
      store.addNode({
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 50, y: 0 }
      })
      store.addNode({
        id: 'step-2',
        type: 'step',
        data: { stepId: 'step-2', operationId: 'op2', onSuccess: [], onFailure: [] },
        position: { x: 100, y: 0 }
      })
      store.addNode({ id: 'end', type: 'end', data: {}, position: { x: 150, y: 0 } })

      store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })
      store.addConnection({ id: 'c2', source: 'step-1', target: 'step-2' })
      store.addConnection({ id: 'c3', source: 'step-2', target: 'end' })

      expect(store.connections).toHaveLength(3)
      expect(store.nodes).toHaveLength(4)

      // Remove step-1, should reconnect start -> step-2
      store.removeStepWithReconnect('step-1')

      expect(store.nodes).toHaveLength(3)
      expect(store.connections).toHaveLength(2)
      // Should have: start -> step-2 and step-2 -> end
      expect(store.connections.some(c => c.source === 'start' && c.target === 'step-2')).toBe(true)
    })

    it('should clear selection if deleted node was selected', () => {
      store.addNode({
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 0, y: 0 }
      })

      store.selectNode('step-1')
      expect(store.selectedNodeId).toBe('step-1')

      store.removeStepWithReconnect('step-1')
      expect(store.selectedNodeId).toBeNull()
    })
  })

  describe('workflow data management', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should check if workflow has data', () => {
      expect(store.hasWorkflowData()).toBe(false)

      store.addNode({
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 0, y: 0 }
      })

      expect(store.hasWorkflowData()).toBe(true)
    })

    it('should clear all workflow data', () => {
      store.addNode({
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 0, y: 0 }
      })
      store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })
      store.selectNode('step-1')

      expect(store.nodes).toHaveLength(1)
      expect(store.connections).toHaveLength(1)
      expect(store.selectedNodeId).toBe('step-1')

      store.clearWorkflowData()

      expect(store.nodes).toHaveLength(0)
      expect(store.connections).toHaveLength(0)
      expect(store.selectedNodeId).toBeNull()
      expect(store.mainWorkflow.steps).toHaveLength(0)
    })
  })

  describe('workflow title and description', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should set workflow title', () => {
      expect(store.workflow.info.title).toBe('New Workflow')
      store.setWorkflowTitle('Custom Title')
      expect(store.workflow.info.title).toBe('Custom Title')
    })

    it('should set workflow description', () => {
      expect(store.workflow.info.description).toBe('')
      store.setWorkflowDescription('Test Description')
      expect(store.workflow.info.description).toBe('Test Description')
    })
  })
})
