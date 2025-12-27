import { defineStore } from 'pinia'
import type { ArazzoWorkflow, ArazzoSourceDescription } from '../types/arazzo'

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
    selectedNodeId: null as string | null,
    selectedSourceId: null as string | null
  }),

  getters: {
    mainWorkflow: (state) => state.workflow.workflows[0],
    
    selectedNode: (state) => {
      if (!state.selectedNodeId) return null
      const workflow = state.workflow.workflows[0]
      if (!workflow) return null
      return workflow.steps.find(
        step => step.stepId === state.selectedNodeId
      ) || null
    },

    sourceDescriptions: (state) => state.workflow.sourceDescriptions
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
    },

    removeSourceDescription(name: string) {
      const index = this.workflow.sourceDescriptions.findIndex(s => s.name === name)
      if (index !== -1) {
        this.workflow.sourceDescriptions.splice(index, 1)
      }
    },

    selectNode(nodeId: string | null) {
      this.selectedNodeId = nodeId
    },

    selectSource(sourceId: string | null) {
      this.selectedSourceId = sourceId
    },

    exportToYAML(): string {
      // Placeholder for YAML export functionality
      return JSON.stringify(this.workflow, null, 2)
    }
  }
})
