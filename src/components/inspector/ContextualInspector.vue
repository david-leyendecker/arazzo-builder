<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import { filterOperations } from '../../services/openapi-service'
import type { ArazzoParameter } from '../../types/arazzo'

const workflowStore = useWorkflowStore()

const selectedNode = computed(() => workflowStore.selectedNode)
const selectedStep = computed(() => workflowStore.selectedStep)
const hasSelection = computed(() => selectedNode.value !== null)
const isStepNode = computed(() => selectedNode.value?.type === 'step')
const isWorkflowNode = computed(() => selectedNode.value?.type === 'workflow')
const isParameterNode = computed(() => selectedNode.value?.type === 'parameter')
const isCriteriaNode = computed(() => selectedNode.value?.type === 'criteria')
const isStartOrEndNode = computed(() => selectedNode.value?.type === 'start' || selectedNode.value?.type === 'end')

// OperationId suggestions
const operationIdInput = ref('')
const showSuggestions = ref(false)
const operationIdValidation = ref<{ valid: boolean; error?: string } | null>(null)

const allOperations = computed(() => workflowStore.allOperations)
const filteredOperations = computed(() => {
  if (!operationIdInput.value) return allOperations.value
  return filterOperations(allOperations.value, operationIdInput.value)
})

// Watch for selected step changes
watch(selectedStep, (newStep) => {
  if (newStep) {
    operationIdInput.value = newStep.operationId || ''
  }
})

// Initialize operationIdInput when component mounts and step is selected
if (selectedStep.value) {
  operationIdInput.value = selectedStep.value.operationId || ''
}

const updateOperationId = (value: string) => {
  operationIdInput.value = value
  showSuggestions.value = false
  
  if (selectedNode.value) {
    workflowStore.updateNode(selectedNode.value.id, { operationId: value })
    
    // Validate the operationId
    if (value) {
      operationIdValidation.value = workflowStore.validateOperationId(value)
      
      // Auto-populate parameters if valid
      if (operationIdValidation.value.valid) {
        autoPopulateParameters(value)
      }
    } else {
      operationIdValidation.value = null
    }
  }
}

const handleOperationIdInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  operationIdInput.value = value
  showSuggestions.value = value.length > 0 && filteredOperations.value.length > 0
  
  if (selectedNode.value) {
    workflowStore.updateNode(selectedNode.value.id, { operationId: value })
    
    // Validate the operationId on input
    if (value && hasOpenAPISpecs.value) {
      operationIdValidation.value = workflowStore.validateOperationId(value)
    } else {
      operationIdValidation.value = null
    }
  }
}

const selectOperation = (operationId: string) => {
  updateOperationId(operationId)
}

const updateDescription = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  if (selectedNode.value) {
    workflowStore.updateNode(selectedNode.value.id, { description: value })
  }
}

// Parameters management
const autoPopulateParameters = (operationId: string) => {
  const operation = workflowStore.findOperation(operationId)
  if (!operation || !operation.parameters || !selectedNode.value) return
  
  const currentStep = selectedStep.value
  if (!currentStep) return
  
  // Only auto-populate if no parameters exist yet
  if (!currentStep.parameters || currentStep.parameters.length === 0) {
    const parameters: ArazzoParameter[] = operation.parameters.map(param => ({
      name: param.name,
      in: param.in,
      value: '', // Default empty value
      description: param.description
    }))
    
    workflowStore.updateNode(selectedNode.value.id, { parameters })
  }
}

const addParameter = () => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentParams = selectedStep.value.parameters || []
  const newParam: ArazzoParameter = {
    name: '',
    in: 'query',
    value: ''
  }
  
  workflowStore.updateNode(selectedNode.value.id, {
    parameters: [...currentParams, newParam]
  })
}

const removeParameter = (index: number) => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentParams = [...(selectedStep.value.parameters || [])]
  currentParams.splice(index, 1)
  
  workflowStore.updateNode(selectedNode.value.id, {
    parameters: currentParams
  })
}

const updateParameter = (index: number, field: keyof ArazzoParameter, value: any) => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentParams = [...(selectedStep.value.parameters || [])]
  if (currentParams[index]) {
    currentParams[index] = {
      ...currentParams[index],
      [field]: value
    }
    
    workflowStore.updateNode(selectedNode.value.id, {
      parameters: currentParams
    })
  }
}

const hasOpenAPISpecs = computed(() => workflowStore.parsedSpecs.length > 0)
const isLoadingSpecs = computed(() => workflowStore.isLoadingSpecs)

// Delay for blur event to allow click on suggestion dropdown
const SUGGESTION_DROPDOWN_DELAY_MS = 200

const handleBlur = () => {
  window.setTimeout(() => showSuggestions.value = false, SUGGESTION_DROPDOWN_DELAY_MS)
}
</script>

<template>
  <div class="contextual-inspector p-4">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Inspector</h2>

    <!-- No Selection State -->
    <div v-if="!hasSelection" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm">Select a node to view details</p>
    </div>

    <!-- Node Details -->
    <div v-else class="space-y-4">
      <!-- Node Type Badge -->
      <div v-if="selectedNode" class="mb-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
          {{ selectedNode.type }}
        </span>
      </div>

      <!-- Workflow Node -->
      <div v-if="isWorkflowNode && selectedNode">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workflow ID</label>
          <input
            type="text"
            :value="(selectedNode.data as { workflowId: string }).workflowId"
            readonly
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Right-click this node to add steps to your workflow.</p>
      </div>

      <!-- Start/End Node -->
      <div v-else-if="isStartOrEndNode && selectedNode">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Node ID</label>
          <input
            type="text"
            :value="selectedNode.id"
            readonly
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {{ selectedNode.type === 'start' ? 'Marks the beginning of workflow execution.' : 'Marks the end of workflow execution.' }}
        </p>
      </div>

      <!-- Parameter Node -->
      <div v-else-if="isParameterNode && selectedNode">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parameter Name</label>
          <input
            type="text"
            :value="(selectedNode.data as { name: string }).name"
            readonly
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-3">Location</label>
          <input
            type="text"
            :value="(selectedNode.data as { in: string }).in"
            readonly
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-3">Value</label>
          <input
            type="text"
            :value="(selectedNode.data as { value: string }).value"
            readonly
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Parameter node for step configuration.</p>
      </div>

      <!-- Criteria Node -->
      <div v-else-if="isCriteriaNode && selectedNode">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Criteria Expression</label>
          <input
            type="text"
            :value="(selectedNode.data as { criteria: string }).criteria"
            readonly
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Success validation criteria for the step.</p>
      </div>

      <!-- Step Node (original content) -->
      <div v-else-if="isStepNode">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Step ID</label>
        <input
          type="text"
          :value="selectedStep?.stepId"
          readonly
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        />
      </div>

      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Operation ID
          <span v-if="isLoadingSpecs" class="text-xs text-gray-500 dark:text-gray-400 ml-2">(Loading specs...)</span>
        </label>
        <input
          type="text"
          :value="operationIdInput"
          @input="handleOperationIdInput"
          @focus="showSuggestions = operationIdInput.length > 0 && filteredOperations.length > 0"
          @blur="handleBlur"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          :class="{ 'border-red-500 dark:border-red-500': operationIdValidation && !operationIdValidation.valid }"
          placeholder="e.g., getUserById"
        />
        
        <!-- Validation feedback -->
        <div v-if="operationIdValidation && !operationIdValidation.valid" class="mt-1 text-xs text-red-600 dark:text-red-400">
          {{ operationIdValidation.error }}
        </div>
        <div v-if="operationIdValidation && operationIdValidation.valid" class="mt-1 text-xs text-green-600 dark:text-green-400">
          ✓ Valid operation
        </div>
        
        <!-- Suggestions dropdown -->
        <div 
          v-if="showSuggestions && hasOpenAPISpecs" 
          class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div
            v-for="operation in filteredOperations.slice(0, 10)"
            :key="operation.operationId"
            @click="selectOperation(operation.operationId)"
            class="px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-0"
          >
            <div class="font-medium text-sm text-gray-800 dark:text-gray-200">{{ operation.operationId }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              <span class="font-semibold">{{ operation.method }}</span> {{ operation.path }}
            </div>
            <div v-if="operation.summary" class="text-xs text-gray-600 dark:text-gray-300 mt-1">{{ operation.summary }}</div>
          </div>
          <div v-if="filteredOperations.length === 0" class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
            No matching operations found
          </div>
        </div>
        
        <!-- No specs warning -->
        <div v-if="!hasOpenAPISpecs && !isLoadingSpecs" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
          💡 Add an OpenAPI source to get operation suggestions
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          :value="selectedStep?.description || ''"
          @input="updateDescription"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Describe this step..."
        ></textarea>
      </div>

      <!-- Parameters Section -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Parameters</label>
          <button 
            @click="addParameter"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            + Add
          </button>
        </div>
        
        <div v-if="!selectedStep?.parameters || selectedStep.parameters.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
          No parameters defined
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="(param, index) in selectedStep.parameters"
            :key="index"
            class="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  :value="param.name"
                  @input="(e) => updateParameter(index, 'name', (e.target as HTMLInputElement).value)"
                  placeholder="Parameter name"
                  class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <select
                  :value="param.in"
                  @change="(e) => updateParameter(index, 'in', (e.target as HTMLSelectElement).value)"
                  class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="path">Path</option>
                  <option value="query">Query</option>
                  <option value="header">Header</option>
                  <option value="cookie">Cookie</option>
                  <option value="body">Body</option>
                </select>
              </div>
              <button
                @click="removeParameter(index)"
                class="ml-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                title="Remove parameter"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              :value="param.value"
              @input="(e) => updateParameter(index, 'value', (e.target as HTMLInputElement).value)"
              placeholder="Value (e.g., $inputs.userId, literal value)"
              class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <!-- Success Criteria -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Success Criteria</label>
          <button class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">+ Add</button>
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400 italic">
          No criteria defined
        </div>
      </div>
      </div>
      <!-- End of Step Node section -->
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
