<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import type { ArazzoParameter, ArazzoReusableRef } from '../../types/arazzo'

// PrimeVue Components
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import FloatLabel from 'primevue/floatlabel'

// Child Components
import { floatLabelConfig } from '../../config/float-label.config'
import KeyValueEditor from './KeyValueEditor.vue'
import ParameterEditor from './ParameterEditor.vue'
import StringListEditor from './StringListEditor.vue'
import ActionEditor from './ActionEditor.vue'

// Centralized Classes
import { INSPECTOR_CLASSES, BUTTON_CLASSES, MESSAGE_SEVERITY } from './inspector-classes'

const props = defineProps<{
  nodeId: string
  workflowId: string
}>()

const workflowStore = useWorkflowStore()
const mainWorkflow = computed(() => workflowStore.mainWorkflow)

// ============================================
// Computed Properties for Two-Way Binding
// ============================================
const workflowSummary = computed({
  get: () => mainWorkflow.value?.summary || '',
  set: (value: string) => workflowStore.updateMainWorkflow({ summary: value })
})

const workflowDescription = computed({
  get: () => mainWorkflow.value?.description || '',
  set: (value: string) => workflowStore.updateMainWorkflow({ description: value })
})

const updateWorkflowInputs = (value: string) => {
  try {
    const parsed = value ? JSON.parse(value) : undefined
    workflowStore.updateMainWorkflow({ inputs: parsed })
  } catch (e) {
    console.warn('Invalid JSON for inputs')
  }
}

// DependsOn
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

// Parameters
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

// Success Actions
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

// Failure Actions
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

// Outputs
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
</script>

<template>
  <div :class="INSPECTOR_CLASSES.content">
    <!-- Basic Info Card -->
    <Card>
      <template #content>
        <div :class="INSPECTOR_CLASSES.fieldGroup">
          <FloatLabel :variant="floatLabelConfig.variant">
            <InputText
              id="workflow-id"
              :model-value="workflowId"
              readonly
              fluid
            />
            <label for="workflow-id">Workflow ID</label>
          </FloatLabel>

          <FloatLabel :variant="floatLabelConfig.variant">
            <InputText
              id="workflow-summary"
              v-model="workflowSummary"
              fluid
            />
            <label for="workflow-summary">Summary</label>
          </FloatLabel>

          <FloatLabel :variant="floatLabelConfig.variant">
            <Textarea
              id="workflow-description"
              v-model="workflowDescription"
              rows="3"
              fluid
            />
            <label for="workflow-description">Description</label>
          </FloatLabel>

          <FloatLabel :variant="floatLabelConfig.variant">
            <Textarea
              id="workflow-inputs"
              :value="mainWorkflow?.inputs ? JSON.stringify(mainWorkflow.inputs, null, 2) : ''"
              @blur="(e) => updateWorkflowInputs((e.target as HTMLTextAreaElement).value)"
              rows="4"
              fluid
              :class="INSPECTOR_CLASSES.fontMono"
            />
            <label for="workflow-inputs">Inputs (JSON Schema)</label>
          </FloatLabel>
        </div>
      </template>
    </Card>

    <!-- Advanced Settings -->
    <Accordion :value="INSPECTOR_CLASSES.accordionValue" :multiple="INSPECTOR_CLASSES.accordionMultiple">
      <!-- Dependencies -->
      <AccordionPanel value="0">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Dependencies</span>
            <Button
              @click.stop="addDependsOn"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Dependency"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!mainWorkflow?.dependsOn || mainWorkflow.dependsOn.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No dependencies defined
          </Message>
          <StringListEditor
            v-else
            :items="mainWorkflow.dependsOn"
            placeholder="$sourceDescriptions.name.workflowId or local workflowId"
            @update:item="updateDependsOn"
            @remove="removeDependsOn"
          />
        </AccordionContent>
      </AccordionPanel>

      <!-- Parameters -->
      <AccordionPanel value="1">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Workflow Parameters</span>
            <Button
              @click.stop="addWorkflowParameter"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Parameter"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!mainWorkflow?.parameters || mainWorkflow.parameters.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No parameters defined
          </Message>
          <ParameterEditor
            v-else
            :parameters="mainWorkflow.parameters"
            @toggle-ref="toggleWorkflowParameterRef"
            @update:field="updateWorkflowParameterField"
            @update:ref="updateWorkflowParameterRef"
            @remove="removeWorkflowParameter"
          />
        </AccordionContent>
      </AccordionPanel>

      <!-- Success Actions -->
      <AccordionPanel value="2">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Success Actions</span>
            <Button
              @click.stop="addSuccessAction"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Success Action"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!mainWorkflow?.successActions || mainWorkflow.successActions.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No success actions defined
          </Message>
          <ActionEditor
            v-else
            :actions="mainWorkflow.successActions"
            @toggle-ref="setSuccessActionRefMode"
            @update:ref="updateSuccessActionRef"
            @update:json="updateSuccessActionJSON"
            @remove="removeSuccessAction"
          />
        </AccordionContent>
      </AccordionPanel>

      <!-- Failure Actions -->
      <AccordionPanel value="3">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Failure Actions</span>
            <Button
              @click.stop="addFailureAction"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Failure Action"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!mainWorkflow?.failureActions || mainWorkflow.failureActions.length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No failure actions defined
          </Message>
          <ActionEditor
            v-else
            :actions="mainWorkflow.failureActions"
            @toggle-ref="setFailureActionRefMode"
            @update:ref="updateFailureActionRef"
            @update:json="updateFailureActionJSON"
            @remove="removeFailureAction"
          />
        </AccordionContent>
      </AccordionPanel>

      <!-- Outputs -->
      <AccordionPanel value="4">
        <AccordionHeader>
          <div :class="INSPECTOR_CLASSES.sectionHeader">
            <span>Workflow Outputs</span>
            <Button
              @click.stop="addWorkflowOutput"
              v-bind="BUTTON_CLASSES.addAction"
              aria-label="Add Output"
            />
          </div>
        </AccordionHeader>
        <AccordionContent>
          <Message v-if="!mainWorkflow?.outputs || Object.keys(mainWorkflow.outputs).length === 0" :severity="MESSAGE_SEVERITY.info" :closable="false">
            No outputs defined
          </Message>
          <KeyValueEditor
            v-else
            :items="mainWorkflow.outputs"
            key-placeholder="Output name"
            value-placeholder="Expression (e.g., $response.body.userId)"
            @update:key="updateWorkflowOutputKey"
            @update:value="updateWorkflowOutputValue"
            @remove="removeWorkflowOutput"
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style scoped>
/* No custom styles needed - uses centralized classes from inspector-classes.ts */
</style>
