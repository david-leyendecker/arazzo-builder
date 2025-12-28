import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkflowStore } from '../workflow'
import type { WorkflowNode } from '../../types/arazzo'

describe('useWorkflowStore - Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('path updates with connections', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should update connection paths when adding connections', () => {
      const startNode: WorkflowNode = {
        id: 'start',
        type: 'start',
        data: {},
        position: { x: 0, y: 0 }
      }
      const stepNode: WorkflowNode = {
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 50, y: 0 }
      }
      const endNode: WorkflowNode = {
        id: 'end',
        type: 'end',
        data: {},
        position: { x: 100, y: 0 }
      }

      store.addNode(startNode)
      store.addNode(stepNode)
      store.addNode(endNode)

      // Add success path
      store.addConnection({
        id: 'c1',
        source: 'step-1',
        target: 'end',
        sourceHandle: 'success',
        targetHandle: 'prev'
      })

      const workflow = store.mainWorkflow
      if (!workflow) throw new Error('Workflow not initialized')
      const step = workflow.steps[0]
      if (!step) throw new Error('Step not found')
      expect(step.onSuccess).toHaveLength(1)
      expect(step.onSuccess[0]?.type).toBe('end')
    })

    it('should handle multiple success and failure paths', () => {
      const stepNode: WorkflowNode = {
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 0, y: 0 }
      }

      store.addNode(stepNode)
      store.addNode({ id: 'next-step', type: 'step', data: { stepId: 'next-step', operationId: 'op2', onSuccess: [], onFailure: [] }, position: { x: 50, y: 0 } })
      store.addNode({ id: 'error-step', type: 'step', data: { stepId: 'error-step', operationId: 'op3', onSuccess: [], onFailure: [] }, position: { x: 50, y: 50 } })

      // Success path
      store.addConnection({
        id: 'c1',
        source: 'step-1',
        target: 'next-step',
        sourceHandle: 'success'
      })

      // Failure path
      store.addConnection({
        id: 'c2',
        source: 'step-1',
        target: 'error-step',
        sourceHandle: 'failure'
      })

      const workflow = store.mainWorkflow
      if (!workflow) throw new Error('Workflow not initialized')
      const step = workflow.steps[0]
      if (!step) throw new Error('Step not found')
      expect(step.onSuccess).toHaveLength(1)
      expect(step.onFailure).toHaveLength(1)
    })
  })

  describe('complex workflow scenarios', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should handle sequential workflow construction', () => {
      // Build: start -> step1 -> step2 -> step3 -> end
      store.addNode({ id: 'start', type: 'start', data: {}, position: { x: 0, y: 0 } })

      const steps = ['step-1', 'step-2', 'step-3']
      steps.forEach((stepId, idx) => {
        store.addNode({
          id: stepId,
          type: 'step',
          data: { stepId, operationId: `op-${idx + 1}`, onSuccess: [], onFailure: [] },
          position: { x: 50 + idx * 50, y: 0 }
        })
      })

      store.addNode({ id: 'end', type: 'end', data: {}, position: { x: 200, y: 0 } })

      // Add connections in sequence
      store.addConnection({ id: 'c0', source: 'start', target: 'step-1' })
      steps.forEach((stepId, idx) => {
        const nextId = idx < steps.length - 1 ? steps[idx + 1] : 'end'
        store.addConnection({ id: `c${idx + 1}`, source: stepId, target: nextId })
      })

      expect(store.nodes).toHaveLength(5) // start + 3 steps + end
      expect(store.connections).toHaveLength(4) // 4 connections
      const workflow = store.mainWorkflow
      if (!workflow) throw new Error('Workflow not initialized')
      expect(workflow.steps).toHaveLength(3) // 3 steps (start/end not in steps)
    })

    it('should handle branching workflows', () => {
      // Build: start -> step1 -> (step2, step3) -> step4 -> end
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
        position: { x: 100, y: -30 }
      })
      store.addNode({
        id: 'step-3',
        type: 'step',
        data: { stepId: 'step-3', operationId: 'op3', onSuccess: [], onFailure: [] },
        position: { x: 100, y: 30 }
      })
      store.addNode({
        id: 'step-4',
        type: 'step',
        data: { stepId: 'step-4', operationId: 'op4', onSuccess: [], onFailure: [] },
        position: { x: 150, y: 0 }
      })
      store.addNode({ id: 'end', type: 'end', data: {}, position: { x: 200, y: 0 } })

      // Create branching connections
      store.addConnection({ id: 'c0', source: 'start', target: 'step-1' })
      store.addConnection({ id: 'c1', source: 'step-1', target: 'step-2' })
      store.addConnection({ id: 'c2', source: 'step-1', target: 'step-3' })
      store.addConnection({ id: 'c3', source: 'step-2', target: 'step-4' })
      store.addConnection({ id: 'c4', source: 'step-3', target: 'step-4' })
      store.addConnection({ id: 'c5', source: 'step-4', target: 'end' })

      const workflow = store.mainWorkflow
      if (!workflow) throw new Error('Workflow not initialized')
      const step1 = workflow.steps[0]
      if (!step1) throw new Error('Step not found')
      expect(step1.onSuccess).toHaveLength(2)

      expect(store._getIncomingConnections('step-4')).toHaveLength(2)
    })
  })

  describe('YAML export and validation integration', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should export valid workflow to YAML', () => {
      store.setWorkflowTitle('Export Test')
      store.setWorkflowDescription('Testing YAML export')

      store.addNode({ id: 'start', type: 'start', data: {}, position: { x: 0, y: 0 } })
      store.addNode({
        id: 'step-1',
        type: 'step',
        data: {
          stepId: 'step-1',
          operationId: 'test-operation',
          description: 'Test step',
          onSuccess: [],
          onFailure: []
        },
        position: { x: 50, y: 0 }
      })
      store.addNode({ id: 'end', type: 'end', data: {}, position: { x: 100, y: 0 } })

      store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })
      store.addConnection({ id: 'c2', source: 'step-1', target: 'end' })

      const yaml = store.exportToYAML()

      expect(yaml).toContain('arazzo: 1.0.0')
      expect(yaml).toContain('Export Test')
      expect(yaml).toContain('test-operation')
      expect(typeof yaml).toBe('string')
    })

    it('should prune empty fields in YAML export', () => {
      store.addNode({ id: 'start', type: 'start', data: {}, position: { x: 0, y: 0 } })
      store.addNode({
        id: 'step-1',
        type: 'step',
        data: {
          stepId: 'step-1',
          operationId: 'test-op',
          onSuccess: [],
          onFailure: []
          // no description, parameters, requestBody, etc.
        },
        position: { x: 50, y: 0 }
      })
      store.addNode({ id: 'end', type: 'end', data: {}, position: { x: 100, y: 0 } })

      store.addConnection({ id: 'c1', source: 'start', target: 'step-1' })
      store.addConnection({ id: 'c2', source: 'step-1', target: 'end' })

      const yaml = store.exportToYAML()

      // Should not contain empty arrays or empty objects
      expect(yaml).not.toContain('parameters: []')
      expect(yaml).not.toContain('parameters: {}')
    })
  })

  describe('performance with memoization', () => {
    let store: ReturnType<typeof useWorkflowStore>

    beforeEach(() => {
      store = useWorkflowStore()
    })

    it('should efficiently lookup cached operations', () => {
      const mockOp = { operationId: 'cached-op', method: 'GET' }
      store.operationMap.set('cached-op', mockOp)

      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        store.findOperation('cached-op')
      }
      const endTime = performance.now()

      // Should be very fast due to memoization (typically < 10ms)
      expect(endTime - startTime).toBeLessThan(50)
      expect(store.operationMap.get('cached-op')).toEqual(mockOp)
    })
  })

  describe('source management', () => {
    let store: ReturnType<typeof useWorkflowStore>
    let localStorageMock: Storage

    beforeEach(() => {
      setActivePinia(createPinia())
      store = useWorkflowStore()
      // Mock localStorage
      localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      }
      vi.stubGlobal('localStorage', localStorageMock)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should add and remove sources', () => {
      // Mock fetchOpenAPISpec to avoid network calls
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.reject(new Error('Network mocked'))
      ))

      const source = {
        name: 'test-source',
        type: 'openapi' as const,
        url: 'https://example.com/openapi.json'
      }

      store.addSourceDescription(source)
      expect(store.workflow.sourceDescriptions).toHaveLength(1)
      expect(store.selectedSourceId).toBe('test-source')

      store.removeSourceDescription('test-source')
      expect(store.workflow.sourceDescriptions).toHaveLength(0)
    })

    it('should select source and maintain workflow state per source', async () => {
      // Mock fetch to prevent network calls
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.reject(new Error('Network mocked'))
      ))

      const source1 = { name: 'source-1', type: 'openapi' as const, url: 'http://api1.com' }
      const source2 = { name: 'source-2', type: 'openapi' as const, url: 'http://api2.com' }

      // Start fresh for this test
      setActivePinia(createPinia())
      const freshStore = useWorkflowStore()

      freshStore.addSourceDescription(source1)
      
      // Wait a tick to let async operations complete
      await new Promise(resolve => setTimeout(resolve, 50))

      freshStore.addNode({
        id: 'step-1',
        type: 'step',
        data: { stepId: 'step-1', operationId: 'op1', onSuccess: [], onFailure: [] },
        position: { x: 0, y: 0 }
      })

      expect(freshStore.selectedSourceId).toBe('source-1')
      // Should have workflow-root + step-1
      expect(freshStore.nodes.filter(n => n.type === 'step').length).toBe(1)

      freshStore.addSourceDescription(source2)
      
      await new Promise(resolve => setTimeout(resolve, 50))

      freshStore.selectSource('source-2')

      expect(freshStore.selectedSourceId).toBe('source-2')
      // After selecting new source, should clear step nodes
      expect(freshStore.nodes.filter(n => n.type === 'step').length).toBe(0)
    })
  })
})
