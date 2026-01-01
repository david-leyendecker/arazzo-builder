<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import { filterOperations } from '../../services/openapi-service'
import type { ArazzoParameter } from '../../types/arazzo'

// PrimeVue Components
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import AutoComplete from 'primevue/autocomplete'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import FloatLabel from 'primevue/floatlabel'

// Child Components
import { floatLabelConfig } from '../../config/float-label.config'
import KeyValueEditor from './KeyValueEditor.vue'
import SimpleParameterEditor from './SimpleParameterEditor.vue'
import StringListEditor from './StringListEditor.vue'

// Centralized Classes
import { INSPECTOR_CLASSES, BUTTON_CLASSES, MESSAGE_SEVERITY, ICON_CLASSES, TEXT_CLASSES } from './inspector-classes'

const props = defineProps<{
  nodeId: string
}>()

const workflowStore = useWorkflowStore()

const selectedNode = computed(() => workflowStore.selectedNode)
const selectedStep = computed(() => workflowStore.selectedStep)
const stepId = computed(() => selectedStep.value?.stepId || '')
const hasOpenAPISpecs = computed(() => workflowStore.parsedSpecs.length > 0)
const isLoadingSpecs = computed(() => workflowStore.isLoadingSpecs)
const allOperations = computed(() => workflowStore.allOperations)

// ============================================
// Operation ID Handling
// ============================================
const operationIdInput = ref('')
const operationIdValidation = ref<{ valid: boolean; error?: string } | null>(null)
const operationSuggestions = ref<any[]>([])

watch(selectedStep, (newStep) => {
  if (newStep) {
    operationIdInput.value = newStep.operationId || ''
  }
})

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

const stepDescription = computed({
  get: () => selectedStep.value?.description || '',
  set: (value: string) => {
    if (selectedNode.value) {
      workflowStore.updateNode(selectedNode.value.id, { description: value })
    }
  }
})

// ============================================
// Parameters
// ============================================
const autoPopulateParameters = (operationId: string) => {
  const operation = workflowStore.findOperation(operationId)
  if (!operation || !operation.parameters || !selectedNode.value) return
  
  const currentStep = selectedStep.value
  if (!currentStep) return
  
  if (!currentStep.parameters || currentStep.parameters.length === 0) {
    const parameters: ArazzoParameter[] = (operation.parameters as any[]).map((param: any) => ({
      name: param.name,
      in: param.in,
      value: '',
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

// ============================================
// Success Criteria
// ============================================
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

// ============================================
// Outputs
// ============================================
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

// ============================================
// Request Body
// ============================================
const updateRequestBody = (value: string) => {
  if (!selectedNode.value) return
  
  try {
    const parsed = value ? JSON.parse(value) : undefined
    workflowStore.updateNode(selectedNode.value.id, {
      requestBody: parsed
    })
  } catch (e) {
    console.warn('Invalid JSON for requestBody')
  }
}
</script>

<template>
  <div :class="INSPECTOR_CLASSES.content">
    <!-- Basic Step Info -->
    <Card>
      <template #content>
        <div :class="INSPECTOR_CLASSES.fieldGroup">
          <FloatLabel :variant="floatLabelConfig.variant">
            <InputText
              id="step-id"
              v-model="stepId"
              readonly
              fluid
            />
            <label for="step-id">Step ID</label>
          </FloatLabel>

          <div>
            <FloatLabel :variant="floatLabelConfig.variant">
              <AutoComplete
                id="operation-id"
                :modelValue="operationIdInput"
                @update:modelValue="onOperationInput"
                :suggestions="operationSuggestions"
                optionLabel="operationId"
                @complete="searchOperations"
                @item-select="onOperationSelect"
                :invalid="!!(operationIdValidation && !operationIdValidation.valid)"
                fluid
              >
                <template #option="slotProps">
                  <div class="flex flex-column gap-1 p-2">
                    <div class="font-semibold">{{ slotProps.option.operationId }}</div>
                    <div class="text-sm text-color-secondary">
                      <span class="font-semibold">{{ slotProps.option.method }}</span> {{ slotProps.option.path }}
                    </div>
                    <div v-if="slotProps.option.summary" class="text-sm text-color-secondary">
                      {{ slotProps.option.summary }}
                    </div>
                  </div>
                </template>
              </AutoComplete>
              <label for="operation-id">Operation ID</label>
            </FloatLabel>

            <!-- Validation Messages -->
            <Message
              v-if="operationIdValidation && !operationIdValidation.valid"
              :severity="MESSAGE_SEVERITY.error"
              :closable="false"
              :class="INSPECTOR_CLASSES.mt2"
            >
              {{ operationIdValidation.error }}
            </Message>
            <Message
              v-if="operationIdValidation && operationIdValidation.valid"
              :severity="MESSAGE_SEVERITY.success"
              :closable="false"
              :class="INSPECTOR_CLASSES.mt2"
            >
              ✓ Valid operation
            </Message>
            <Message
              v-if="!hasOpenAPISpecs && !isLoadingSpecs"
              :severity="MESSAGE_SEVERITY.warn"
              :closable="false"
              :class="INSPECTOR_CLASSES.mt2"
            >
              💡 Add an OpenAPI source to get operation suggestions
            </Message>
            <div v-if="isLoadingSpecs" :class="`${TEXT_CLASSES.small} ${TEXT_CLASSES.secondary} ${INSPECTOR_CLASSES.mt2}`">
              <i :class="ICON_CLASSES.spinner"></i>Loading OpenAPI specifications...
            </div>
          </div>

          <FloatLabel :variant="floatLabelConfig.variant">
            <Textarea
              id="step-description"
              v-model="stepDescription"
              rows="3"
              fluid
            />
            <label for="step-description">Description</label>
          </FloatLabel>
        </div>
      </template>
    </Card>

    <!-- Step Details -->
    <Accordion :value="INSPECTOR_CLASSES.accordionValue" :multiple="INSPECTOR_CLASSES.accordionMultiple">
      <!-- Parameters -->
      <AccordionPanel value="0">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Parameters</span>
            <Button
              @click.stop="addParameter"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Parameter"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!selectedStep?.parameters || selectedStep.parameters.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No parameters defined
          </Message>
          <SimpleParameterEditor
            v-else
            :parameters="selectedStep.parameters"
            @update:field="updateParameter"
            @remove="removeParameter"
          />
        </AccordionContent>
      </AccordionPanel>

      <!-- Success Criteria -->
      <AccordionPanel value="1">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Success Criteria</span>
            <Button
              @click.stop="addSuccessCriteria"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Criteria"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!selectedStep?.successCriteria || selectedStep.successCriteria.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No success criteria defined
          </Message>
          <StringListEditor
            v-else
            :items="selectedStep.successCriteria"
            placeholder="e.g., $statusCode == 200"
            @update:item="updateSuccessCriteria"
            @remove="removeSuccessCriteria"
          />
        </AccordionContent>
      </AccordionPanel>

      <!-- Outputs -->
      <AccordionPanel value="2">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Outputs</span>
            <Button
              @click.stop="addOutput"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Output"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!selectedStep?.outputs || Object.keys(selectedStep.outputs).length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No outputs defined
          </Message>
          <KeyValueEditor
            v-else
            :items="selectedStep.outputs"
            key-placeholder="Output name"
            value-placeholder="e.g., $response.body.userId"
            @update:key="updateOutputKey"
            @update:value="updateOutputValue"
            @remove="removeOutput"
          />
        </AccordionContent>
      </AccordionPanel>

      <!-- Request Body -->
      <AccordionPanel value="3">
        <AccordionHeader>
          <span>Request Body</span>
        </AccordionHeader>
        <AccordionContent>
          <FloatLabel :variant="floatLabelConfig.variant">
            <Textarea
              id="request-body"
              :value="selectedStep?.requestBody ? JSON.stringify(selectedStep.requestBody, null, 2) : ''"
              @blur="(e) => updateRequestBody((e.target as HTMLTextAreaElement).value)"
              rows="6"
              fluid
              :class="INSPECTOR_CLASSES.fontMono"
            />
            <label for="request-body">JSON</label>
          </FloatLabel>
          <small :class="`${TEXT_CLASSES.secondary} ${TEXT_CLASSES.block} ${INSPECTOR_CLASSES.mt2}`">Enter valid JSON for the request body</small>
        </AccordionContent>
      </AccordionPanel>

      <!-- Flow Control (Read-only) -->
      <AccordionPanel value="4">
        <AccordionHeader>
          <span>Flow Control</span>
        </AccordionHeader>
        <AccordionContent>
          <div :class="INSPECTOR_CLASSES.fieldGroup">
            <!-- On Success -->
            <div>
              <Divider align="left">
                <span :class="`${TEXT_CLASSES.small} ${TEXT_CLASSES.semibold}`">On Success</span>
              </Divider>
              <Message v-if="!selectedStep?.onSuccess || selectedStep.onSuccess.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
                No success actions defined. Connect the green handle to define success flow.
              </Message>
              <div v-else :class="INSPECTOR_CLASSES.itemList">
                <Card
                  v-for="(target, index) in selectedStep.onSuccess"
                  :key="index"
                  :class="INSPECTOR_CLASSES.flowCardSuccess"
                >
                  <template #content>
                    <div :class="INSPECTOR_CLASSES.flowContent">
                      <i :class="ICON_CLASSES.arrowRightSuccess"></i>
                      <span :class="TEXT_CLASSES.semibold">{{ target.stepId }}</span>
                    </div>
                  </template>
                </Card>
              </div>
            </div>

            <!-- On Failure -->
            <div>
              <Divider align="left">
                <span :class="`${TEXT_CLASSES.small} ${TEXT_CLASSES.semibold}`">On Failure</span>
              </Divider>
              <Message v-if="!selectedStep?.onFailure || selectedStep.onFailure.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
                No failure actions defined. Connect the red handle to define failure flow.
              </Message>
              <div v-else :class="INSPECTOR_CLASSES.itemList">
                <Card
                  v-for="(target, index) in selectedStep.onFailure"
                  :key="index"
                  :class="INSPECTOR_CLASSES.flowCardFailure"
                >
                  <template #content>
                    <div :class="INSPECTOR_CLASSES.flowContent">
                      <i :class="ICON_CLASSES.arrowRightFailure"></i>
                      <span :class="TEXT_CLASSES.semibold">{{ target.stepId }}</span>
                    </div>
                  </template>
                </Card>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style scoped>
/* No custom styles needed - uses centralized classes from inspector-classes.ts */
</style>
