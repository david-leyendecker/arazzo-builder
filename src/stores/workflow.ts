import { defineStore } from 'pinia'
import yaml from 'js-yaml'
import type { ArazzoWorkflow, ArazzoSourceDescription, ArazzoStep, ArazzoCriterionTarget, WorkflowNode, WorkflowConnection } from '../types/arazzo'
import type { ParsedOpenAPISpec } from '../services/openapi-service'
import { fetchOpenAPISpec } from '../services/openapi-service'

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
    triggerWorkflowNodeCreation: 0 as number // Timestamp trigger for workflow node creation
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

    allOperations: (state) => {
      return state.parsedSpecs.flatMap(spec => spec.operations)
    },

    isLoadingSpecs: (state) => state.loadingSpecs.size > 0
  },

  actions: {
    setWorkflowTitle(title: string) {
      this.workflow.info.title = title
    },

    setWorkflowDescription(description: string) {
      this.workflow.info.description = description
    },

    addSourceDescription(source: ArazzoSourceDescription) {
      this.workflow.sourceDescriptions.push(source)
      
      // Automatically fetch and parse the spec if it's an OpenAPI source
      if (source.type === 'openapi' && source.url) {
        this.loadOpenAPISpec(source.name, source.url)
      }
    },

    removeSourceDescription(name: string) {
      const index = this.workflow.sourceDescriptions.findIndex(s => s.name === name)
      if (index !== -1) {
        this.workflow.sourceDescriptions.splice(index, 1)
      }
      
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
    },

    addConnection(connection: WorkflowConnection) {
      this.connections.push(connection)
      this.updateConnectionPaths()
    },

    removeConnection(connectionId: string) {
      const index = this.connections.findIndex(c => c.id === connectionId)
      if (index !== -1) {
        this.connections.splice(index, 1)
        this.updateConnectionPaths()
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

      // Build paths from connections
      this.connections.forEach(conn => {
        const sourceNode = this.nodes.find(n => n.id === conn.source)
        const targetNode = this.nodes.find(n => n.id === conn.target)
        
        if (!sourceNode || sourceNode.type !== 'step') return
        
        const stepIndex = workflow.steps.findIndex(
          s => s.stepId === conn.source
        )
        
        if (stepIndex === -1) return
        
        const step = workflow.steps[stepIndex]
        if (!step) return
        
        const sourceHandle = conn.sourceHandle || 'success'
        
        const target: ArazzoCriterionTarget = {
          type: targetNode?.type === 'end' ? 'end' : 'step',
          stepId: targetNode?.type === 'step' ? conn.target : undefined
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
      this.selectedSourceId = sourceId
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
      
      // Check for start node
      const hasStart = this.nodes.some(n => n.type === 'start')
      if (!hasStart) {
        errors.push('Workflow must have a start node')
      }
      
      // Check for end node
      const hasEnd = this.nodes.some(n => n.type === 'end')
      if (!hasEnd) {
        errors.push('Workflow must have an end node')
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
            if (step.successCriteria && step.successCriteria.length > 0) {
              cleanStep.successCriteria = step.successCriteria
            }
            if (step.onSuccess && step.onSuccess.length > 0) {
              cleanStep.onSuccess = step.onSuccess
            }
            if (step.onFailure && step.onFailure.length > 0) {
              cleanStep.onFailure = step.onFailure
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
        
        // Add the new spec
        this.parsedSpecs.push(parsedSpec)
        
        // Trigger workflow node creation (will be handled by the canvas component)
        this.triggerWorkflowNodeCreation = Date.now()
        console.log('OpenAPI spec loaded, triggering workflow node creation:', this.triggerWorkflowNodeCreation)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        this.specErrors[sourceName] = errorMessage
        console.error(`Failed to load spec ${sourceName}:`, error)
      } finally {
        this.loadingSpecs.delete(sourceName)
      }
    },

    /**
     * Find an operation by operationId
     */
    findOperation(operationId: string) {
      for (const spec of this.parsedSpecs) {
        const operation = spec.operations.find(op => op.operationId === operationId)
        if (operation) return operation
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
    }
  }
})
