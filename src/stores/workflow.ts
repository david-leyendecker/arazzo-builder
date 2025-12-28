import { defineStore } from 'pinia'
import yaml from 'js-yaml'
import type { ArazzoWorkflow, ArazzoSourceDescription, ArazzoStep, ArazzoCriterionTarget, WorkflowNode, WorkflowConnection } from '../types/arazzo'
import type { ParsedOpenAPISpec } from '../services/openapi-service'
import { fetchOpenAPISpec } from '../services/openapi-service'

const STORAGE_KEY = 'arazzo-workflows'
const SOURCES_KEY = 'arazzo-sources'

interface PersistedWorkflowData {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  workflow: ArazzoWorkflow
}

interface WorkflowStorage {
  [sourceName: string]: PersistedWorkflowData
}

interface SourcesStorage {
  sources: ArazzoSourceDescription[]
  selectedSourceId: string | null
}

/**
 * Store for managing the Arazzo workflow state
 */
export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    workflow: {
      arazzo: '1.0.0',
      info: {
        title: 'New Workflow',
        version: '1.0.0',
        description: ''
      },
      sourceDescriptions: [] as ArazzoSourceDescription[],
      workflows: [
        {
          workflowId: 'main-workflow',
          summary: 'Main workflow',
          description: '',
          steps: []
        }
      ]
    } as ArazzoWorkflow,
    nodes: [] as WorkflowNode[],
    connections: [] as WorkflowConnection[],
    selectedNodeId: null as string | null,
    selectedSourceId: null as string | null,
    parsedSpecs: [] as ParsedOpenAPISpec[],
    loadingSpecs: new Set<string>(),
    specErrors: {} as Record<string, string>,
    triggerWorkflowNodeCreation: 0 as number, // Timestamp trigger for workflow node creation
    operationMap: new Map<string, any>(), // Memoized operation lookup for O(1) access
    deferPathUpdates: false // Flag to batch updateConnectionPaths calls
  }),

  getters: {
    mainWorkflow: (state) => state.workflow.workflows[0],
    
    selectedNode: (state) => {
      if (!state.selectedNodeId) return null
      return state.nodes.find(node => node.id === state.selectedNodeId) || null
    },

    selectedStep: (state) => {
      if (!state.selectedNodeId) return null
      const workflow = state.workflow.workflows[0]
      if (!workflow) return null
      return workflow.steps.find(
        step => step.stepId === state.selectedNodeId
      ) || null
    },

    sourceDescriptions: (state) => state.workflow.sourceDescriptions,

    selectedSource: (state) => {
      if (!state.selectedSourceId) return null
      return state.workflow.sourceDescriptions.find(s => s.name === state.selectedSourceId) || null
    },

    allOperations: (state) => {
      return state.parsedSpecs.flatMap(spec => spec.operations)
    },

    isLoadingSpecs: (state) => state.loadingSpecs.size > 0
  },

  actions: {
    // Helper methods for internal optimization
    _getIncomingConnections(nodeId: string) {
      return this.connections.filter(c => c.target === nodeId)
    },

    _getOutgoingConnections(nodeId: string) {
      return this.connections.filter(c => c.source === nodeId)
    },

    _getNodeById(nodeId: string) {
      return this.nodes.find(n => n.id === nodeId)
    },

    setWorkflowTitle(title: string) {
      this.workflow.info.title = title
      this.saveWorkflowToStorage()
    },

    setWorkflowDescription(description: string) {
      this.workflow.info.description = description
      this.saveWorkflowToStorage()
    },

    addSourceDescription(source: ArazzoSourceDescription) {
      this.workflow.sourceDescriptions.push(source)
      
      // Auto-select the first source
      if (this.workflow.sourceDescriptions.length === 1) {
        this.selectSource(source.name)
      }
      
      // Automatically fetch and parse the spec if it's an OpenAPI source
      if (source.type === 'openapi' && source.url) {
        this.loadOpenAPISpec(source.name, source.url)
      }
      
      // Save sources to storage after adding
      this.saveSourcesToStorage()
    },

    removeSourceDescription(name: string) {
      const index = this.workflow.sourceDescriptions.findIndex(s => s.name === name)
      if (index !== -1) {
        this.workflow.sourceDescriptions.splice(index, 1)
      }
      
      // If removing the selected source, select another one or clear viewport
      if (this.selectedSourceId === name) {
        if (this.workflow.sourceDescriptions.length > 0) {
          // Select the next source if available, otherwise the previous one
          const newIndex = Math.min(index, this.workflow.sourceDescriptions.length - 1)
          const newSource = this.workflow.sourceDescriptions[newIndex]
          if (newSource) {
            this.selectSource(newSource.name)
          }
        } else {
          // No sources left, clear everything
          this.selectedSourceId = null
          this.nodes = []
          this.connections = []
          this.selectedNodeId = null
          if (this.workflow.workflows[0]) {
            this.workflow.workflows[0].steps = []
          }
        }
      }
      
      // Save sources to storage
      this.saveSourcesToStorage()
      
      // Remove the parsed spec
      const specIndex = this.parsedSpecs.findIndex(s => s.sourceName === name)
      if (specIndex !== -1) {
        this.parsedSpecs.splice(specIndex, 1)
      }
      
      // Remove any errors
      delete this.specErrors[name]
    },

    addNode(node: WorkflowNode) {
      this.nodes.push(node)
      
      // Add to steps if it's a step node
      if (node.type === 'step' && this.workflow.workflows[0]) {
        const stepData = node.data as ArazzoStep
        this.workflow.workflows[0].steps.push(stepData)
      }
      
      this.saveWorkflowToStorage()
    },

    removeNode(nodeId: string) {
      const index = this.nodes.findIndex(n => n.id === nodeId)
      if (index !== -1) {
        const node = this.nodes[index]
        this.nodes.splice(index, 1)
        
        // Remove from steps if it's a step node
        if (node && node.type === 'step' && this.workflow.workflows[0]) {
          const stepData = node.data as ArazzoStep
          const stepIndex = this.workflow.workflows[0].steps.findIndex(
            s => s.stepId === stepData.stepId
          )
          if (stepIndex !== -1) {
            this.workflow.workflows[0].steps.splice(stepIndex, 1)
          }
        }
        
        // Remove all connections involving this node
        this.connections = this.connections.filter(
          conn => conn.source !== nodeId && conn.target !== nodeId
        )
      }
      
      this.saveWorkflowToStorage()
    },

    updateNode(nodeId: string, data: Partial<ArazzoStep>) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node && node.type === 'step' && this.workflow.workflows[0]) {
        node.data = { ...node.data, ...data }
        
        // Update in steps array
        const stepIndex = this.workflow.workflows[0].steps.findIndex(
          s => s.stepId === nodeId
        )
        if (stepIndex !== -1) {
          const currentStep = this.workflow.workflows[0].steps[stepIndex]
          if (currentStep) {
            this.workflow.workflows[0].steps[stepIndex] = {
              ...currentStep,
              ...data,
              stepId: currentStep.stepId,
              operationId: data.operationId !== undefined ? data.operationId : currentStep.operationId
            }
          }
        }
      }
      
      this.saveWorkflowToStorage()
    },

    /**
     * Remove a step node while reconnecting its incoming edges to its outgoing edges
     * to preserve the flow order.
     */
    removeStepWithReconnect(stepId: string) {
      const node = this.nodes.find(n => n.id === stepId)
      if (!node || node.type !== 'step') return

      // Capture existing connections before removal (using optimized helpers)
      const incoming = this._getIncomingConnections(stepId)
      const outgoing = this._getOutgoingConnections(stepId)

      // Create new connections bridging incoming sources to outgoing targets
      incoming.forEach(inConn => {
        outgoing.forEach(outConn => {
          // Avoid duplicate connections
          const exists = this.connections.some(c =>
            c.source === inConn.source &&
            c.target === outConn.target &&
            (c.sourceHandle || 'success') === (inConn.sourceHandle || 'success') &&
            (c.targetHandle || 'prev') === (outConn.targetHandle || 'prev')
          )
          if (exists) return

          this.connections.push({
            id: `reconn-${inConn.source}-${outConn.target}-${Date.now()}`,
            source: inConn.source,
            target: outConn.target,
            sourceHandle: inConn.sourceHandle || 'success',
            targetHandle: outConn.targetHandle || 'prev'
          })
        })
      })

      // Remove the node and its original connections
      this.removeNode(stepId)

      // Update paths to reflect new wiring
      this.updateConnectionPaths()

      // Clear selection if it was the deleted node
      if (this.selectedNodeId === stepId) {
        this.selectedNodeId = null
      }
    },

    addConnection(connection: WorkflowConnection) {
      this.connections.push(connection)
      if (!this.deferPathUpdates) {
        this.updateConnectionPaths()
      }
      this.saveWorkflowToStorage()
    },

    removeConnection(connectionId: string) {
      const index = this.connections.findIndex(c => c.id === connectionId)
      if (index !== -1) {
        this.connections.splice(index, 1)
        if (!this.deferPathUpdates) {
          this.updateConnectionPaths()
        }
        this.saveWorkflowToStorage()
      }
    },

    /**
     * Update onSuccess/onFailure paths based on visual connections
     */
    updateConnectionPaths() {
      const workflow = this.workflow.workflows[0]
      if (!workflow) return
      
      // Reset all paths
      workflow.steps.forEach(step => {
        step.onSuccess = []
        step.onFailure = []
      })

      // Build paths from connections (only step-to-step connections are supported)
      this.connections.forEach(conn => {
        const sourceNode = this._getNodeById(conn.source)
        const targetNode = this._getNodeById(conn.target)
        
        if (!sourceNode || sourceNode.type !== 'step') return
        if (!targetNode || targetNode.type !== 'step') return
        
        const stepIndex = workflow.steps.findIndex(
          s => s.stepId === conn.source
        )
        
        if (stepIndex === -1) return
        
        const step = workflow.steps[stepIndex]
        if (!step) return
        
        const sourceHandle = conn.sourceHandle || 'success'
        
        const target: ArazzoCriterionTarget = {
          type: 'step',
          stepId: conn.target
        }
        
        if (sourceHandle === 'success') {
          if (!step.onSuccess) step.onSuccess = []
          step.onSuccess.push(target)
        } else if (sourceHandle === 'failure') {
          if (!step.onFailure) step.onFailure = []
          step.onFailure.push(target)
        }
      })
    },

    selectNode(nodeId: string | null) {
      this.selectedNodeId = nodeId
    },

    selectSource(sourceId: string | null) {
      // Save current workflow before switching (use OLD selectedSourceId)
      const oldSourceId = this.selectedSourceId
      if (oldSourceId && oldSourceId !== sourceId) {
        // Save to the OLD source before changing
        this.saveWorkflowToStorage()
      }
      
      // Now update to the new source
      this.selectedSourceId = sourceId
      
      // Save the new selection
      this.saveSourcesToStorage()
      
      // Load workflow for the new source
      if (sourceId) {
        // First clear the current workflow state
        this.nodes = []
        this.connections = []
        this.selectedNodeId = null
        if (this.workflow.workflows[0]) {
          this.workflow.workflows[0].steps = []
        }
        
        // Then try to load saved workflow
        const loaded = this.loadWorkflowFromStorage()
        
        // If no workflow was loaded (new source), create initial workflow structure
        if (!loaded && this.nodes.length === 0) {
          this.addNode({
            id: 'workflow-root',
            type: 'workflow',
            data: { workflowId: 'main-workflow' },
            position: { x: 100, y: 100 }
          })
        }
      }
    },

    /**
     * Check if there is any workflow data (nodes or steps)
     */
    hasWorkflowData(): boolean {
      return this.nodes.length > 0 || (this.workflow.workflows[0]?.steps.length || 0) > 0
    },

    /**
     * Clear all workflow data (nodes, connections, and steps)
     */
    clearWorkflowData() {
      this.nodes = []
      this.connections = []
      this.selectedNodeId = null
      if (this.workflow.workflows[0]) {
        this.workflow.workflows[0].steps = []
      }
      
      this.saveWorkflowToStorage()
    },

    /**
     * Validate workflow structure
     */
    validateWorkflow(): { valid: boolean; errors: string[] } {
      const errors: string[] = []
      const workflow = this.workflow.workflows[0]
      
      if (!workflow) {
        errors.push('No workflow defined')
        return { valid: false, errors }
      }
      
      // Check each step has an operationId
      workflow.steps.forEach(step => {
        if (!step.operationId || step.operationId.trim() === '') {
          errors.push(`Step "${step.stepId}" is missing an operationId`)
        } else if (this.parsedSpecs.length > 0) {
          // Validate against OpenAPI specs only if specs are available
          const validation = this.validateOperationId(step.operationId)
          if (!validation.valid) {
            errors.push(`Step "${step.stepId}": ${validation.error}`)
          }
        }
      })
      
      // Check for orphaned nodes (nodes with no connections)
      const connectedNodes = new Set<string>()
      this.connections.forEach(conn => {
        connectedNodes.add(conn.source)
        connectedNodes.add(conn.target)
      })
      
      const orphanedSteps = this.nodes.filter(
        n => n.type === 'step' && !connectedNodes.has(n.id)
      )
      
      if (orphanedSteps.length > 0) {
        errors.push(`Found ${orphanedSteps.length} disconnected step(s)`)
      }
      
      return {
        valid: errors.length === 0,
        errors
      }
    },

    /**
     * Export workflow to YAML format
     */
    exportToYAML(): string {
      // Update connection paths before export
      this.updateConnectionPaths()
      
      // Create a clean copy of the workflow for export
      const exportData = {
        arazzo: this.workflow.arazzo,
        info: this.workflow.info,
        sourceDescriptions: this.workflow.sourceDescriptions,
        workflows: this.workflow.workflows.map(w => ({
          workflowId: w.workflowId,
          summary: w.summary,
          description: w.description,
          ...(w.inputs && Object.keys(w.inputs).length > 0 ? { inputs: w.inputs } : {}),
          steps: w.steps.map(step => {
            const cleanStep: Partial<ArazzoStep> = {
              stepId: step.stepId,
              operationId: step.operationId
            }
            
            if (step.description) cleanStep.description = step.description
            if (step.parameters && step.parameters.length > 0) {
              cleanStep.parameters = step.parameters
            }
            if (step.requestBody) {
              cleanStep.requestBody = step.requestBody
            }
            if (step.successCriteria && step.successCriteria.length > 0) {
              cleanStep.successCriteria = step.successCriteria
            }
            if (step.onSuccess && step.onSuccess.length > 0) {
              cleanStep.onSuccess = step.onSuccess
            }
            if (step.onFailure && step.onFailure.length > 0) {
              cleanStep.onFailure = step.onFailure
            }
            if (step.outputs && Object.keys(step.outputs).length > 0) {
              cleanStep.outputs = step.outputs
            }
            
            return cleanStep as ArazzoStep
          }),
          ...(w.outputs && Object.keys(w.outputs).length > 0 ? { outputs: w.outputs } : {})
        }))
      }
      
      // Convert to YAML
      return yaml.dump(exportData, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      })
    },

    /**
     * Load and parse an OpenAPI specification
     */
    async loadOpenAPISpec(sourceName: string, url: string) {
      this.loadingSpecs.add(sourceName)
      delete this.specErrors[sourceName]
      
      try {
        const parsedSpec = await fetchOpenAPISpec(url, sourceName)
        
        // Remove existing spec if present
        const existingIndex = this.parsedSpecs.findIndex(s => s.sourceName === sourceName)
        if (existingIndex !== -1) {
          this.parsedSpecs.splice(existingIndex, 1)
        }
        
        // Add the new spec and invalidate operation cache
        this.parsedSpecs.push(parsedSpec)
        this.operationMap.clear()
        
        // Trigger workflow node creation (will be handled by the canvas component)
        this.triggerWorkflowNodeCreation = Date.now()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        this.specErrors[sourceName] = errorMessage
        console.error(`Failed to load spec ${sourceName}:`, error)
      } finally {
        this.loadingSpecs.delete(sourceName)
      }
    },

    /**
     * Find an operation by operationId (uses memoized map for O(1) lookup)
     */
    findOperation(operationId: string) {
      // Check memoized map first
      if (this.operationMap.has(operationId)) {
        return this.operationMap.get(operationId)
      }
      
      // Fallback: search specs and cache result
      for (const spec of this.parsedSpecs) {
        const operation = spec.operations.find(op => op.operationId === operationId)
        if (operation) {
          this.operationMap.set(operationId, operation)
          return operation
        }
      }
      
      return null
    },

    /**
     * Validate that an operationId exists in the loaded specs
     */
    validateOperationId(operationId: string): { valid: boolean; error?: string } {
      if (!operationId) {
        return { valid: false, error: 'Operation ID is required' }
      }
      
      const operation = this.findOperation(operationId)
      if (!operation) {
        return { valid: false, error: 'Operation ID not found in any source' }
      }
      
      return { valid: true }
    },

    /**
     * Save current workflow state to localStorage for the selected source
     */
    saveWorkflowToStorage() {
      if (!this.selectedSourceId) return
      
      try {
        const storage: WorkflowStorage = this.loadAllWorkflowsFromStorage()
        
        storage[this.selectedSourceId] = {
          nodes: this.nodes,
          connections: this.connections,
          workflow: this.workflow
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
        
        // Also save sources and selected source
        this.saveSourcesToStorage()
      } catch (error) {
        console.error('Failed to save workflow to localStorage:', error)
      }
    },

    /**
     * Save sources to localStorage
     */
    saveSourcesToStorage() {
      try {
        const sourcesData: SourcesStorage = {
          sources: this.workflow.sourceDescriptions,
          selectedSourceId: this.selectedSourceId
        }
        localStorage.setItem(SOURCES_KEY, JSON.stringify(sourcesData))
      } catch (error) {
        console.error('Failed to save sources to localStorage:', error)
      }
    },

    /**
     * Load sources from localStorage
     */
    loadSourcesFromStorage() {
      try {
        const data = localStorage.getItem(SOURCES_KEY)
        if (!data) return false
        
        const sourcesData = JSON.parse(data) as SourcesStorage
        if (sourcesData.sources && sourcesData.sources.length > 0) {
          this.workflow.sourceDescriptions = sourcesData.sources
          this.selectedSourceId = sourcesData.selectedSourceId
          
          // Reload OpenAPI specs for all sources
          sourcesData.sources.forEach(source => {
            if (source.type === 'openapi' && source.url) {
              this.loadOpenAPISpec(source.name, source.url)
            }
          })
          
          return true
        }
      } catch (error) {
        console.error('Failed to load sources from localStorage:', error)
      }
      
      return false
    },

    /**
     * Load all workflows from localStorage
     */
    loadAllWorkflowsFromStorage(): WorkflowStorage {
      try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return {}
        return JSON.parse(data) as WorkflowStorage
      } catch (error) {
        console.error('Failed to load workflows from localStorage:', error)
        return {}
      }
    },

    /**
     * Load workflow state from localStorage for the selected source
     */
    loadWorkflowFromStorage() {
      if (!this.selectedSourceId) return false
      
      try {
        const storage = this.loadAllWorkflowsFromStorage()
        const savedWorkflow = storage[this.selectedSourceId]
        
        if (savedWorkflow) {
          this.nodes = savedWorkflow.nodes || []
          this.connections = savedWorkflow.connections || []
          
          // Restore workflow data but preserve sourceDescriptions from current state
          if (savedWorkflow.workflow) {
            this.workflow = {
              ...savedWorkflow.workflow,
              sourceDescriptions: this.workflow.sourceDescriptions
            }
          }
          
          return true
        }
      } catch (error) {
        console.error('Failed to load workflow from localStorage:', error)
      }
      
      return false
    },

    /**
     * Initialize the store, loading saved state if available
     */
    initializeStore() {
      // Load sources first
      const sourcesLoaded = this.loadSourcesFromStorage()
      
      // Then load workflow for the selected source
      if (sourcesLoaded && this.selectedSourceId) {
        this.loadWorkflowFromStorage()
      }
    },

    /**
     * Batch multiple connection updates to defer path recalculation
     * Usage: store.batchConnections(() => { ...add/remove connections... })
     */
    batchConnections(callback: () => void) {
      const wasDeferred = this.deferPathUpdates
      this.deferPathUpdates = true
      
      try {
        callback()
      } finally {
        this.deferPathUpdates = wasDeferred
        // Only update paths if we weren't already deferring
        if (!wasDeferred) {
          this.updateConnectionPaths()
        }
      }
    }
  }
})
