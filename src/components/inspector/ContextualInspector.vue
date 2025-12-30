<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import { filterOperations } from '../../services/openapi-service'
import type { ArazzoParameter, ArazzoReusableRef } from '../../types/arazzo'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Badge from 'primevue/badge'
import Message from 'primevue/message'
import AutoComplete from 'primevue/autocomplete'
import SectionHeader from './SectionHeader.vue'
import KeyValueEditor from './KeyValueEditor.vue'
import ParameterEditor from './ParameterEditor.vue'
import SimpleParameterEditor from './SimpleParameterEditor.vue'
import StringListEditor from './StringListEditor.vue'
import ActionEditor from './ActionEditor.vue'

const workflowStore = useWorkflowStore()

const selectedNode = computed(() => workflowStore.selectedNode)
const selectedStep = computed(() => workflowStore.selectedStep)
const hasSelection = computed(() => selectedNode.value !== null)
const isStepNode = computed(() => selectedNode.value?.type === 'step')
const isWorkflowNode = computed(() => selectedNode.value?.type === 'workflow')

// Live validation view
const validationResult = computed(() => workflowStore.validateWorkflow())
const validationErrors = computed(() => validationResult.value.errors)

// Main workflow helpers
const mainWorkflow = computed(() => workflowStore.mainWorkflow)

const updateWorkflowSummary = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  workflowStore.updateMainWorkflow({ summary: value })
}

const updateWorkflowDescription = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  workflowStore.updateMainWorkflow({ description: value })
}

// Inputs (JSON Schema) management
const updateWorkflowInputs = (value: string) => {
  try {
    const parsed = value ? JSON.parse(value) : undefined
    workflowStore.updateMainWorkflow({ inputs: parsed })
  } catch (e) {
    console.warn('Invalid JSON for inputs')
  }
}

// DependsOn management
const addDependsOn = () => {
  const list = [...(mainWorkflow.value?.dependsOn || [])]
  list.push('')
  workflowStore.updateMainWorkflow({ dependsOn: list })
}

const removeDependsOn = (index: number) => {
  const list = [...(mainWorkflow.value?.dependsOn || [])]
  list.splice(index, 1)
  workflowStore.updateMainWorkflow({ dependsOn: list })
}

const updateDependsOn = (index: number, value: string) => {
  const list = [...(mainWorkflow.value?.dependsOn || [])]
  list[index] = value
  workflowStore.updateMainWorkflow({ dependsOn: list })
}

// Workflow-level Parameters (ArazzoParameter | $ref)
const addWorkflowParameter = () => {
  const params = [...(mainWorkflow.value?.parameters || [])]
  const newParam: ArazzoParameter = { name: '', in: 'query', value: '' }
  params.push(newParam)
  workflowStore.updateMainWorkflow({ parameters: params })
}

const removeWorkflowParameter = (index: number) => {
  const params = [...(mainWorkflow.value?.parameters || [])]
  params.splice(index, 1)
  workflowStore.updateMainWorkflow({ parameters: params })
}

const toggleWorkflowParameterRef = (index: number, useRef: boolean) => {
  const params = [...(mainWorkflow.value?.parameters || [])]
  if (!params[index]) return
  if (useRef) {
    params[index] = { $ref: '' } as ArazzoReusableRef
  } else {
    params[index] = { name: '', in: 'query', value: '' }
  }
  workflowStore.updateMainWorkflow({ parameters: params })
}

const updateWorkflowParameterField = (index: number, field: keyof ArazzoParameter, value: any) => {
  const params = [...(mainWorkflow.value?.parameters || [])]
  const item = params[index]
  if (!item || (item as ArazzoReusableRef).$ref !== undefined) return
  params[index] = { ...(item as ArazzoParameter), [field]: value }
  workflowStore.updateMainWorkflow({ parameters: params })
}

const updateWorkflowParameterRef = (index: number, refValue: string) => {
  const params = [...(mainWorkflow.value?.parameters || [])]
  const item = params[index]
  if (!item) return
  params[index] = { $ref: refValue } as ArazzoReusableRef
  workflowStore.updateMainWorkflow({ parameters: params })
}

// Workflow-level Success/Failure Actions (Record | $ref)
const addSuccessAction = () => {
  const actions = [...(mainWorkflow.value?.successActions || [])]
  actions.push({})
  workflowStore.updateMainWorkflow({ successActions: actions })
}

const removeSuccessAction = (index: number) => {
  const actions = [...(mainWorkflow.value?.successActions || [])]
  actions.splice(index, 1)
  workflowStore.updateMainWorkflow({ successActions: actions })
}

const setSuccessActionRefMode = (index: number, useRef: boolean) => {
  const actions = [...(mainWorkflow.value?.successActions || [])]
  if (!actions[index]) return
  actions[index] = useRef ? ({ $ref: '' } as ArazzoReusableRef) : {}
  workflowStore.updateMainWorkflow({ successActions: actions })
}

const updateSuccessActionRef = (index: number, refValue: string) => {
  const actions = [...(mainWorkflow.value?.successActions || [])]
  actions[index] = { $ref: refValue } as ArazzoReusableRef
  workflowStore.updateMainWorkflow({ successActions: actions })
}

const updateSuccessActionJSON = (index: number, value: string) => {
  try {
    const obj = value ? JSON.parse(value) : {}
    const actions = [...(mainWorkflow.value?.successActions || [])]
    actions[index] = obj
    workflowStore.updateMainWorkflow({ successActions: actions })
  } catch (e) {
    console.warn('Invalid JSON for success action')
  }
}

const addFailureAction = () => {
  const actions = [...(mainWorkflow.value?.failureActions || [])]
  actions.push({})
  workflowStore.updateMainWorkflow({ failureActions: actions })
}

const removeFailureAction = (index: number) => {
  const actions = [...(mainWorkflow.value?.failureActions || [])]
  actions.splice(index, 1)
  workflowStore.updateMainWorkflow({ failureActions: actions })
}

const setFailureActionRefMode = (index: number, useRef: boolean) => {
  const actions = [...(mainWorkflow.value?.failureActions || [])]
  if (!actions[index]) return
  actions[index] = useRef ? ({ $ref: '' } as ArazzoReusableRef) : {}
  workflowStore.updateMainWorkflow({ failureActions: actions })
}

const updateFailureActionRef = (index: number, refValue: string) => {
  const actions = [...(mainWorkflow.value?.failureActions || [])]
  actions[index] = { $ref: refValue } as ArazzoReusableRef
  workflowStore.updateMainWorkflow({ failureActions: actions })
}

const updateFailureActionJSON = (index: number, value: string) => {
  try {
    const obj = value ? JSON.parse(value) : {}
    const actions = [...(mainWorkflow.value?.failureActions || [])]
    actions[index] = obj
    workflowStore.updateMainWorkflow({ failureActions: actions })
  } catch (e) {
    console.warn('Invalid JSON for failure action')
  }
}

// Workflow-level Outputs
const addWorkflowOutput = () => {
  const outputs = { ...(mainWorkflow.value?.outputs || {}) }
  const newKey = `output${Object.keys(outputs).length + 1}`
  outputs[newKey] = ''
  workflowStore.updateMainWorkflow({ outputs })
}

const removeWorkflowOutput = (key: string) => {
  const outputs = { ...(mainWorkflow.value?.outputs || {}) }
  delete outputs[key]
  workflowStore.updateMainWorkflow({ outputs })
}

const updateWorkflowOutputKey = (oldKey: string, newKey: string) => {
  if (oldKey === newKey) return
  const outputs = { ...(mainWorkflow.value?.outputs || {}) }
  const value = outputs[oldKey]
  delete outputs[oldKey]
  outputs[newKey] = value
  workflowStore.updateMainWorkflow({ outputs })
}

const updateWorkflowOutputValue = (key: string, value: any) => {
  const outputs = { ...(mainWorkflow.value?.outputs || {}) }
  outputs[key] = value
  workflowStore.updateMainWorkflow({ outputs })
}

// OperationId suggestions
const operationIdInput = ref('')
const operationIdValidation = ref<{ valid: boolean; error?: string } | null>(null)
const operationSuggestions = ref<any[]>([])

const allOperations = computed(() => workflowStore.allOperations)

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
  if (selectedNode.value) {
    workflowStore.updateNode(selectedNode.value.id, { operationId: value })
    if (value) {
      operationIdValidation.value = workflowStore.validateOperationId(value)
      if (operationIdValidation.value.valid) {
        autoPopulateParameters(value)
      }
    } else {
      operationIdValidation.value = null
    }
  }
}

const onOperationInput = (value: string) => {
  operationIdInput.value = value
  if (selectedNode.value) {
    workflowStore.updateNode(selectedNode.value.id, { operationId: value })
    if (value && hasOpenAPISpecs.value) {
      operationIdValidation.value = workflowStore.validateOperationId(value)
    } else {
      operationIdValidation.value = null
    }
  }
}

const searchOperations = (event: any) => {
  const query = event.query || ''
  const list = query ? filterOperations(allOperations.value, query) : allOperations.value
  operationSuggestions.value = list.slice(0, 10)
}

const onOperationSelect = (event: any) => {
  const op = event.value
  if (op && op.operationId) {
    updateOperationId(op.operationId)
  }
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
    const parameters: ArazzoParameter[] = (operation.parameters as any[]).map((param: any) => ({
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

// No custom dropdown/blur handling needed with AutoComplete
</script>

<template>
  <div class="contextual-inspector">
    <h2 class="inspector-title">Inspector</h2>

    <!-- Validation Errors Panel -->
    <div v-if="validationErrors.length > 0" class="validation-panel">
      <div class="validation-title">Validation issues</div>
      <ul class="validation-list">
        <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
      </ul>
    </div>

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
      <div v-if="isWorkflowNode && selectedNode" class="workflow-section">
        <div>
          <label class="field-label">Workflow ID</label>
          <InputText
            :value="(selectedNode.data as { workflowId: string }).workflowId"
            readonly
            class="field-input"
          />
          <p class="field-hint">Right-click this node to add steps.</p>
        </div>

        <div>
          <label class="field-label">Summary</label>
          <InputText
            :value="mainWorkflow?.summary || ''"
            @input="updateWorkflowSummary"
            placeholder="Brief summary of workflow"
            class="field-input"
          />
        </div>

        <div>
          <label class="field-label">Description</label>
          <Textarea
            :value="mainWorkflow?.description || ''"
            @input="updateWorkflowDescription"
            rows="3"
            placeholder="CommonMark supported"
            class="field-input"
          />
        </div>

        <div>
          <label class="field-label">Inputs (JSON Schema)</label>
          <Textarea
            :value="mainWorkflow?.inputs ? JSON.stringify(mainWorkflow.inputs, null, 2) : ''"
            @blur="(e) => updateWorkflowInputs((e.target as HTMLTextAreaElement).value)"
            rows="4"
            placeholder='{ "type": "object", "properties": { ... } }'
            class="code-textarea"
          />
        </div>

        <!-- dependsOn -->
        <div>
          <SectionHeader label="Depends On" @add="addDependsOn" />
          <div v-if="!mainWorkflow?.dependsOn || mainWorkflow.dependsOn.length === 0" class="empty-text">No dependencies</div>
          <StringListEditor
            v-else
            :items="mainWorkflow.dependsOn"
            placeholder="$sourceDescriptions.name.workflowId or local workflowId"
            @update:item="updateDependsOn"
            @remove="removeDependsOn"
          />
        </div>

        <!-- Workflow Parameters -->
        <div>
          <SectionHeader label="Workflow Parameters" @add="addWorkflowParameter" />
          <div v-if="!mainWorkflow?.parameters || mainWorkflow.parameters.length === 0" class="empty-text">No parameters</div>
          <ParameterEditor
            v-else
            :parameters="mainWorkflow.parameters"
            @toggle-ref="toggleWorkflowParameterRef"
            @update:field="updateWorkflowParameterField"
            @update:ref="updateWorkflowParameterRef"
            @remove="removeWorkflowParameter"
          />
        </div>

        <!-- Success Actions -->
        <div>
          <SectionHeader label="Success Actions" @add="addSuccessAction" />
          <div v-if="!mainWorkflow?.successActions || mainWorkflow.successActions.length === 0" class="empty-text">None</div>
          <ActionEditor
            v-else
            :actions="mainWorkflow.successActions"
            @toggle-ref="setSuccessActionRefMode"
            @update:ref="updateSuccessActionRef"
            @update:json="updateSuccessActionJSON"
            @remove="removeSuccessAction"
          />
        </div>

        <!-- Failure Actions -->
        <div>
          <SectionHeader label="Failure Actions" @add="addFailureAction" />
          <div v-if="!mainWorkflow?.failureActions || mainWorkflow.failureActions.length === 0" class="empty-text">None</div>
          <ActionEditor
            v-else
            :actions="mainWorkflow.failureActions"
            @toggle-ref="setFailureActionRefMode"
            @update:ref="updateFailureActionRef"
            @update:json="updateFailureActionJSON"
            @remove="removeFailureAction"
          />
        </div>

        <!-- Workflow Outputs -->
        <div>
          <SectionHeader label="Workflow Outputs" @add="addWorkflowOutput" />
          <div v-if="!mainWorkflow?.outputs || Object.keys(mainWorkflow.outputs).length === 0" class="empty-text">None</div>
          <KeyValueEditor
            v-else
            :items="mainWorkflow.outputs"
            key-placeholder="Output name"
            value-placeholder="Expression (e.g., $response.body.userId)"
            @update:key="updateWorkflowOutputKey"
            @update:value="updateWorkflowOutputValue"
            @remove="removeWorkflowOutput"
          />
        </div>
      </div>

      <!-- Step Node -->
      <div v-else-if="isStepNode" class="field-group">
        <div class="field">
          <label class="field-label">Step ID</label>
          <InputText :value="selectedStep?.stepId" readonly class="field-input" />
        </div>

        <div class="field operation-field">
          <label class="field-label">
            Operation ID
            <span v-if="isLoadingSpecs" class="loading-text">(Loading specs...)</span>
          </label>
          <AutoComplete
            :modelValue="operationIdInput"
            @update:modelValue="onOperationInput"
            :suggestions="operationSuggestions"
            optionLabel="operationId"
            @complete="searchOperations"
            @item-select="onOperationSelect"
            :invalid="!!(operationIdValidation && !operationIdValidation.valid)"
            placeholder="e.g., getUserById"
            class="field-input"
          >
            <template #option="slotProps">
              <div class="suggestion-item">
                <div class="suggestion-title">{{ slotProps.option.operationId }}</div>
                <div class="suggestion-method"><span class="method-name">{{ slotProps.option.method }}</span> {{ slotProps.option.path }}</div>
                <div v-if="slotProps.option.summary" class="suggestion-summary">{{ slotProps.option.summary }}</div>
              </div>
            </template>
          </AutoComplete>
          
          <!-- Validation feedback -->
          <Message v-if="operationIdValidation && !operationIdValidation.valid" severity="error" :closable="false" class="validation-message">
            {{ operationIdValidation.error }}
          </Message>
          <Message v-if="operationIdValidation && operationIdValidation.valid" severity="success" :closable="false" class="validation-message">
            Valid operation
          </Message>
          
          <!-- Suggestions handled via AutoComplete -->
          
          <!-- No specs warning -->
          <Message v-if="!hasOpenAPISpecs && !isLoadingSpecs" severity="warn" :closable="false" class="validation-message">
            💡 Add an OpenAPI source to get operation suggestions
          </Message>
        </div>

        <div class="field">
          <label class="field-label">Description</label>
          <Textarea :value="selectedStep?.description || ''" @input="updateDescription" rows="3" placeholder="Describe this step..." class="field-input" />
        </div>

        <!-- Parameters Section -->
        <div class="section">
          <SectionHeader label="Parameters" @add="addParameter" />
          
          <div v-if="!selectedStep?.parameters || selectedStep.parameters.length === 0" class="empty-text">No parameters defined</div>
          
          <SimpleParameterEditor
            v-else
            :parameters="selectedStep.parameters"
            @update:field="updateParameter"
            @remove="removeParameter"
          />
        </div>

        <!-- Success Criteria -->
        <div class="section">
          <SectionHeader label="Success Criteria" @add="addSuccessCriteria" />
          
          <div v-if="!selectedStep?.successCriteria || selectedStep.successCriteria.length === 0" class="empty-text">No criteria defined</div>
          
          <StringListEditor
            v-else
            :items="selectedStep.successCriteria"
            placeholder="e.g., $statusCode == 200"
            @update:item="updateSuccessCriteria"
            @remove="removeSuccessCriteria"
          />
        </div>

        <!-- Outputs Section -->
        <div class="section">
          <SectionHeader label="Outputs" @add="addOutput" />
          
          <div v-if="!selectedStep?.outputs || Object.keys(selectedStep.outputs).length === 0" class="empty-text">No outputs defined</div>
          
          <KeyValueEditor
            v-else
            :items="selectedStep.outputs"
            key-placeholder="Output name"
            value-placeholder="e.g., $response.body.userId"
            @update:key="updateOutputKey"
            @update:value="updateOutputValue"
            @remove="removeOutput"
          />
        </div>

        <!-- Request Body Section -->
        <div class="field">
          <label class="field-label">Request Body (JSON)</label>
          <Textarea :value="selectedStep?.requestBody ? JSON.stringify(selectedStep.requestBody, null, 2) : ''" @blur="(e) => updateRequestBody((e.target as HTMLTextAreaElement).value)" rows="4" placeholder='{ "key": "value" }' class="code-textarea" />
          <p class="help-text">Enter valid JSON for the request body</p>
        </div>

        <!-- OnSuccess (Read-only) -->
        <div class="field">
          <label class="field-label">On Success</label>
          <div v-if="!selectedStep?.onSuccess || selectedStep.onSuccess.length === 0" class="empty-text">No success actions defined (connect nodes to define)</div>
          <div v-else class="flow-items">
            <div v-for="(target, index) in selectedStep.onSuccess" :key="index" class="flow-item success-flow">
              {{ `Go to step: ${target.stepId}` }}
            </div>
          </div>
          <p class="help-text">Connect the green handle to define success flow</p>
        </div>

        <!-- OnFailure (Read-only) -->
        <div class="field">
          <label class="field-label">On Failure</label>
          <div v-if="!selectedStep?.onFailure || selectedStep.onFailure.length === 0" class="empty-text">No failure actions defined (connect nodes to define)</div>
          <div v-else class="flow-items">
            <div v-for="(target, index) in selectedStep.onFailure" :key="index" class="flow-item failure-flow">
              {{ `Go to step: ${target.stepId}` }}
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
  overflow-y: auto;
  height: 100%;
}

.inspector-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0 0 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: var(--p-text-muted-color);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  color: var(--p-text-muted-color);
}

.empty-text {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
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

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.validation-panel {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--p-red-200);
  background: var(--p-red-50);
  font-size: 0.875rem;
  color: var(--p-red-700);
}

.validation-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.validation-list {
  list-style: disc;
  list-style-position: inside;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.workflow-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
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
  color: var(--p-text-muted-color);
  margin: 0.25rem 0 0 0;
}

.loading-text {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin-left: 0.5rem;
}

.operation-field {
  position: relative;
}

.suggestion-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--p-surface-200);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--p-surface-100);
}

.suggestion-title {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--p-text-color);
}

.suggestion-method {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.method-name {
  font-weight: 600;
}

.suggestion-summary {
  font-size: 0.75rem;
  color: var(--p-text-secondary-color);
  margin-top: 0.25rem;
}

.code-textarea {
  font-family: monospace;
  font-size: 0.85em;
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
  color: var(--p-text-color);
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