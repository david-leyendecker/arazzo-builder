<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import { filterOperations } from '../../services/openapi-service'
import type { ArazzoParameter } from '../../types/arazzo'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Badge from 'primevue/badge'
import Message from 'primevue/message'

const workflowStore = useWorkflowStore()

const selectedNode = computed(() => workflowStore.selectedNode)
const selectedStep = computed(() => workflowStore.selectedStep)
const hasSelection = computed(() => selectedNode.value !== null)
const isStepNode = computed(() => selectedNode.value?.type === 'step')
const isWorkflowNode = computed(() => selectedNode.value?.type === 'workflow')
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

// Success Criteria management
const addSuccessCriteria = () => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentCriteria = selectedStep.value.successCriteria || []
  
  workflowStore.updateNode(selectedNode.value.id, {
    successCriteria: [...currentCriteria, '']
  })
}

const removeSuccessCriteria = (index: number) => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentCriteria = [...(selectedStep.value.successCriteria || [])]
  currentCriteria.splice(index, 1)
  
  workflowStore.updateNode(selectedNode.value.id, {
    successCriteria: currentCriteria
  })
}

const updateSuccessCriteria = (index: number, value: string) => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentCriteria = [...(selectedStep.value.successCriteria || [])]
  currentCriteria[index] = value
  
  workflowStore.updateNode(selectedNode.value.id, {
    successCriteria: currentCriteria
  })
}

// Outputs management
const addOutput = () => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentOutputs = selectedStep.value.outputs || {}
  const newKey = `output${Object.keys(currentOutputs).length + 1}`
  
  workflowStore.updateNode(selectedNode.value.id, {
    outputs: { ...currentOutputs, [newKey]: '' }
  })
}

const removeOutput = (key: string) => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentOutputs = { ...(selectedStep.value.outputs || {}) }
  delete currentOutputs[key]
  
  workflowStore.updateNode(selectedNode.value.id, {
    outputs: currentOutputs
  })
}

const updateOutputKey = (oldKey: string, newKey: string) => {
  if (!selectedNode.value || !selectedStep.value || oldKey === newKey) return
  
  const currentOutputs = { ...(selectedStep.value.outputs || {}) }
  const value = currentOutputs[oldKey]
  delete currentOutputs[oldKey]
  currentOutputs[newKey] = value
  
  workflowStore.updateNode(selectedNode.value.id, {
    outputs: currentOutputs
  })
}

const updateOutputValue = (key: string, value: any) => {
  if (!selectedNode.value || !selectedStep.value) return
  
  const currentOutputs = { ...(selectedStep.value.outputs || {}) }
  currentOutputs[key] = value
  
  workflowStore.updateNode(selectedNode.value.id, {
    outputs: currentOutputs
  })
}

// RequestBody management
const updateRequestBody = (value: string) => {
  if (!selectedNode.value) return
  
  try {
    const parsed = value ? JSON.parse(value) : undefined
    workflowStore.updateNode(selectedNode.value.id, {
      requestBody: parsed
    })
  } catch (e) {
    // Keep invalid JSON in a local state for editing
    console.warn('Invalid JSON for requestBody')
  }
}

const hasOpenAPISpecs = computed(() => workflowStore.parsedSpecs.length > 0)
const isLoadingSpecs = computed(() => workflowStore.isLoadingSpecs)

// Select options for parameter "in" field
const parameterInOptions = [
  { label: 'Path', value: 'path' },
  { label: 'Query', value: 'query' },
  { label: 'Header', value: 'header' },
  { label: 'Cookie', value: 'cookie' },
  { label: 'Body', value: 'body' }
]

// Delay for blur event to allow click on suggestion dropdown
const SUGGESTION_DROPDOWN_DELAY_MS = 200

const handleBlur = () => {
  window.setTimeout(() => showSuggestions.value = false, SUGGESTION_DROPDOWN_DELAY_MS)
}
</script>

<template>
  <div class="contextual-inspector">
    <h2 class="inspector-title">Inspector</h2>

    <!-- No Selection State -->
    <div v-if="!hasSelection" class="empty-state">
      <i class="pi pi-info-circle empty-icon"></i>
      <p class="empty-text">Select a node to view details</p>
    </div>

    <!-- Node Details -->
    <div v-else class="inspector-content">
      <!-- Node Type Badge -->
      <div v-if="selectedNode" class="node-badge-wrapper">
        <Badge :value="selectedNode.type" severity="info" />
      </div>

      <!-- Workflow Node -->
      <div v-if="isWorkflowNode && selectedNode" class="field-group">
        <div class="field">
          <label class="field-label">Workflow ID</label>
          <InputText
            :value="(selectedNode.data as { workflowId: string }).workflowId"
            readonly
            class="field-input"
          />
        </div>
        <Message severity="info" :closable="false" class="info-message">
          Right-click this node to add steps to your workflow.
        </Message>
      </div>

      <!-- Start/End Node -->
      <div v-else-if="isStartOrEndNode && selectedNode" class="field-group">
        <div class="field">
          <label class="field-label">Node ID</label>
          <InputText
            :value="selectedNode.id"
            readonly
            class="field-input"
          />
        </div>
        <Message severity="info" :closable="false" class="info-message">
          {{ selectedNode.type === 'start' ? 'Marks the beginning of workflow execution.' : 'Marks the end of workflow execution.' }}
        </Message>
      </div>

      <!-- Step Node (original content) -->
      <div v-else-if="isStepNode" class="field-group">
      <div class="field">
        <label class="field-label">Step ID</label>
        <InputText
          :value="selectedStep?.stepId"
          readonly
          class="field-input"
        />
      </div>

      <div class="field operation-field">
        <label class="field-label">
          Operation ID
          <span v-if="isLoadingSpecs" class="loading-text">(Loading specs...)</span>
        </label>
        <InputText
          :value="operationIdInput"
          @input="handleOperationIdInput"
          @focus="showSuggestions = operationIdInput.length > 0 && filteredOperations.length > 0"
          @blur="handleBlur"
          :invalid="operationIdValidation && !operationIdValidation.valid"
          placeholder="e.g., getUserById"
          class="field-input"
        />
        
        <!-- Validation feedback -->
        <Message 
          v-if="operationIdValidation && !operationIdValidation.valid" 
          severity="error" 
          :closable="false"
          class="validation-message"
        >
          {{ operationIdValidation.error }}
        </Message>
        <Message 
          v-if="operationIdValidation && operationIdValidation.valid" 
          severity="success" 
          :closable="false"
          class="validation-message"
        >
          Valid operation
        </Message>
        
        <!-- Suggestions dropdown -->
        <div 
          v-if="showSuggestions && hasOpenAPISpecs" 
          class="suggestions-dropdown"
        >
          <div
            v-for="operation in filteredOperations.slice(0, 10)"
            :key="operation.operationId"
            @click="selectOperation(operation.operationId)"
            class="suggestion-item"
          >
            <div class="suggestion-title">{{ operation.operationId }}</div>
            <div class="suggestion-method">
              <span class="method-name">{{ operation.method }}</span> {{ operation.path }}
            </div>
            <div v-if="operation.summary" class="suggestion-summary">{{ operation.summary }}</div>
          </div>
          <div v-if="filteredOperations.length === 0" class="suggestion-empty">
            No matching operations found
          </div>
        </div>
        
        <!-- No specs warning -->
        <Message 
          v-if="!hasOpenAPISpecs && !isLoadingSpecs" 
          severity="warn" 
          :closable="false"
          class="validation-message"
        >
          💡 Add an OpenAPI source to get operation suggestions
        </Message>
      </div>

      <div class="field">
        <label class="field-label">Description</label>
        <Textarea
          :value="selectedStep?.description || ''"
          @input="updateDescription"
          rows="3"
          placeholder="Describe this step..."
          class="field-input"
        />
      </div>

      <!-- Parameters Section -->
      <div class="section">
        <div class="section-header">
          <label class="section-label">Parameters</label>
          <Button 
            @click="addParameter"
            label="Add"
            icon="pi pi-plus"
            text
            size="small"
          />
        </div>
        
        <div v-if="!selectedStep?.parameters || selectedStep.parameters.length === 0" class="empty-text">
          No parameters defined
        </div>
        
        <div v-else class="items-list">
          <div
            v-for="(param, index) in selectedStep.parameters"
            :key="index"
            class="parameter-item"
          >
            <div class="parameter-row">
              <div class="parameter-inputs">
                <InputText
                  :value="param.name"
                  @input="(e) => updateParameter(index, 'name', (e.target as HTMLInputElement).value)"
                  placeholder="Parameter name"
                  size="small"
                />
                <Select
                  :modelValue="param.in"
                  @update:modelValue="(value) => updateParameter(index, 'in', value)"
                  :options="parameterInOptions"
                  optionLabel="label"
                  optionValue="value"
                  size="small"
                />
              </div>
              <Button
                @click="removeParameter(index)"
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                size="small"
                title="Remove parameter"
              />
            </div>
            <InputText
              :value="param.value"
              @input="(e) => updateParameter(index, 'value', (e.target as HTMLInputElement).value)"
              placeholder="Value (e.g., $inputs.userId, literal value)"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Success Criteria -->
      <div class="section">
        <div class="section-header">
          <label class="section-label">Success Criteria</label>
          <Button 
            @click="addSuccessCriteria"
            label="Add"
            icon="pi pi-plus"
            text
            size="small"
          />
        </div>
        
        <div v-if="!selectedStep?.successCriteria || selectedStep.successCriteria.length === 0" class="empty-text">
          No criteria defined
        </div>
        
        <div v-else class="items-list">
          <div
            v-for="(criteria, index) in selectedStep.successCriteria"
            :key="index"
            class="criteria-item"
          >
            <InputText
              :value="criteria"
              @input="(e) => updateSuccessCriteria(index, (e.target as HTMLInputElement).value)"
              placeholder="e.g., $statusCode == 200"
              size="small"
              class="flex-1-input"
            />
            <Button
              @click="removeSuccessCriteria(index)"
              icon="pi pi-times"
              text
              rounded
              severity="danger"
              size="small"
              title="Remove criteria"
            />
          </div>
        </div>
      </div>

      <!-- Outputs Section -->
      <div class="section">
        <div class="section-header">
          <label class="section-label">Outputs</label>
          <Button 
            @click="addOutput"
            label="Add"
            icon="pi pi-plus"
            text
            size="small"
          />
        </div>
        
        <div v-if="!selectedStep?.outputs || Object.keys(selectedStep.outputs).length === 0" class="empty-text">
          No outputs defined
        </div>
        
        <div v-else class="items-list">
          <div
            v-for="(value, key) in selectedStep.outputs"
            :key="key"
            class="output-item"
          >
            <div class="output-row">
              <InputText
                :value="key"
                @blur="(e) => updateOutputKey(key as string, (e.target as HTMLInputElement).value)"
                placeholder="Output name"
                size="small"
                class="flex-1-input"
              />
              <Button
                @click="removeOutput(key as string)"
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                size="small"
                title="Remove output"
              />
            </div>
            <InputText
              :value="value"
              @input="(e) => updateOutputValue(key as string, (e.target as HTMLInputElement).value)"
              placeholder="e.g., $response.body.userId"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Request Body Section -->
      <div class="field">
        <label class="field-label">Request Body (JSON)</label>
        <Textarea
          :value="selectedStep?.requestBody ? JSON.stringify(selectedStep.requestBody, null, 2) : ''"
          @blur="(e) => updateRequestBody((e.target as HTMLTextAreaElement).value)"
          rows="4"
          placeholder='{ "key": "value" }'
          class="code-textarea"
        />
        <p class="help-text">Enter valid JSON for the request body</p>
      </div>

      <!-- OnSuccess (Read-only) -->
      <div class="field">
        <label class="field-label">On Success</label>
        <div v-if="!selectedStep?.onSuccess || selectedStep.onSuccess.length === 0" class="empty-text">
          No success actions defined (connect nodes to define)
        </div>
        <div v-else class="flow-items">
          <div
            v-for="(target, index) in selectedStep.onSuccess"
            :key="index"
            class="flow-item success-flow"
          >
            {{ target.type === 'end' ? 'End workflow' : `Go to step: ${target.stepId}` }}
          </div>
        </div>
        <p class="help-text">Connect the green handle to define success flow</p>
      </div>

      <!-- OnFailure (Read-only) -->
      <div class="field">
        <label class="field-label">On Failure</label>
        <div v-if="!selectedStep?.onFailure || selectedStep.onFailure.length === 0" class="empty-text">
          No failure actions defined (connect nodes to define)
        </div>
        <div v-else class="flow-items">
          <div
            v-for="(target, index) in selectedStep.onFailure"
            :key="index"
            class="flow-item failure-flow"
          >
            {{ target.type === 'end' ? 'End workflow' : `Go to step: ${target.stepId}` }}
          </div>
        </div>
        <p class="help-text">Connect the red handle to define failure flow</p>
      </div>
      </div>
      <!-- End of Step Node section -->
    </div>
  </div>
</template>

<style scoped>
.contextual-inspector {
  padding: 1rem;
}

.inspector-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  color: var(--text-tertiary);
}

.empty-text {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  font-style: italic;
  margin: 0;
}

.inspector-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.node-badge-wrapper {
  margin-bottom: 0.5rem;
}

.field-group,
.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label,
.section-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.field-input {
  width: 100%;
}

.info-message,
.validation-message {
  font-size: 0.75rem;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0.25rem 0 0 0;
}

.loading-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-left: 0.5rem;
}

.operation-field {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  z-index: 10;
  width: 100%;
  margin-top: 0.25rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  max-height: 15rem;
  overflow: auto;
}

.suggestion-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-primary);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--bg-tertiary);
}

.suggestion-title {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.suggestion-method {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.method-name {
  font-weight: 600;
}

.suggestion-summary {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.suggestion-empty {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  font-style: italic;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.parameter-item,
.output-item {
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 0.375rem;
  border: 1px solid var(--border-primary);
}

.parameter-row,
.output-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.parameter-inputs {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.criteria-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.flex-1-input {
  flex: 1;
}

.code-textarea {
  font-family: monospace;
  font-size: 0.75rem;
  width: 100%;
}

.flow-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.flow-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.success-flow {
  background: var(--p-green-50);
  border: 1px solid var(--p-green-200);
}

.failure-flow {
  background: var(--p-red-50);
  border: 1px solid var(--p-red-200);
}
</style>
