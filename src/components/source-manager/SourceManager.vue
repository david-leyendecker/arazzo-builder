<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import ConfirmModal from '../common/ConfirmModal.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Card from 'primevue/card'
import { floatLabelConfig } from '../../config/float-label.config'

const workflowStore = useWorkflowStore()

const sources = computed(() => workflowStore.sourceDescriptions)
const selectedSource = computed(() => workflowStore.selectedSource)
const showAddForm = ref(false)
const newSource = ref({
  name: '',
  url: '',
  type: 'openapi' as 'openapi' | 'arazzo'
})

const sourceTypeOptions = [
  { label: 'OpenAPI', value: 'openapi' },
  { label: 'Arazzo', value: 'arazzo' }
]

const confirmOpen = ref(false)
const pendingRemoval = ref<(typeof sources.value)[number] | null>(null)
const pendingSelection = ref<string | null>(null)
const confirmationType = ref<'remove' | 'switch'>('remove')

const confirmMessage = computed(() => {
  if (confirmationType.value === 'remove' && pendingRemoval.value) {
    return `Delete OpenAPI source "${pendingRemoval.value.name}"? This action cannot be undone.`
  } else if (confirmationType.value === 'switch' && pendingSelection.value) {
    return `Switching to a different OpenAPI source will clear your current workflow. Do you want to continue?`
  }
  return ''
})

const confirmTitle = computed(() => {
  return confirmationType.value === 'remove' ? 'Remove OpenAPI source?' : 'Switch OpenAPI source?'
})

const confirmButtonText = computed(() => {
  return confirmationType.value === 'remove' ? 'Delete' : 'Continue'
})

const isDestructive = computed(() => {
  return confirmationType.value === 'remove'
})

const addSource = () => {
  if (newSource.value.name && newSource.value.url) {
    workflowStore.addSourceDescription({
      name: newSource.value.name,
      url: newSource.value.url,
      type: newSource.value.type
    })
    newSource.value = { name: '', url: '', type: 'openapi' }
    showAddForm.value = false
  }
}

const removeSource = (name: string) => {
  workflowStore.removeSourceDescription(name)
}

const requestRemoveSource = (source: (typeof sources.value)[number]) => {
  if (source.type === 'openapi') {
    pendingRemoval.value = source
    confirmationType.value = 'remove'
    confirmOpen.value = true
    return
  }

  removeSource(source.name)
}

const confirmRemoval = () => {
  if (!pendingRemoval.value) return

  removeSource(pendingRemoval.value.name)
  pendingRemoval.value = null
}

const cancelRemoval = () => {
  pendingRemoval.value = null
  confirmOpen.value = false
}

const selectSource = (sourceName: string) => {
  // If already selected, do nothing
  if (selectedSource.value?.name === sourceName) return

  // Check if there's existing workflow data
  if (workflowStore.hasWorkflowData()) {
    pendingSelection.value = sourceName
    confirmationType.value = 'switch'
    confirmOpen.value = true
    return
  }

  // No workflow data, just select
  workflowStore.selectSource(sourceName)
}

const confirmSwitch = () => {
  if (!pendingSelection.value) return

  // selectSource() will handle saving the current workflow and loading the new one
  workflowStore.selectSource(pendingSelection.value)
  pendingSelection.value = null
}

const cancelSwitch = () => {
  pendingSelection.value = null
  confirmOpen.value = false
}

const handleConfirm = () => {
  if (confirmationType.value === 'remove') {
    confirmRemoval()
  } else {
    confirmSwitch()
  }
}

const handleCancel = () => {
  if (confirmationType.value === 'remove') {
    cancelRemoval()
  } else {
    cancelSwitch()
  }
}

const cancelAdd = () => {
  newSource.value = { name: '', url: '', type: 'openapi' }
  showAddForm.value = false
}
</script>

<template>
  <div class="source-manager">
    <div class="header">
      <h2 class="title">OpenAPI Sources</h2>
      <Button
        v-if="!showAddForm"
        @click="showAddForm = true"
        label="Add"
        icon="pi pi-plus"
        text
        size="small"
      />
    </div>

    <!-- Add Source Form -->
    <Card v-if="showAddForm" class="add-form">
      <template #content>
        <div class="form-fields">
          <FloatLabel :variant="floatLabelConfig.variant">
            <InputText
              id="source-name"
              v-model="newSource.name"
              class="input-field"
            />
            <label for="source-name">Source name</label>
          </FloatLabel>
          <FloatLabel :variant="floatLabelConfig.variant">
            <InputText
              id="source-url"
              v-model="newSource.url"
              class="input-field"
            />
            <label for="source-url">URL or path</label>
          </FloatLabel>
          <FloatLabel :variant="floatLabelConfig.variant">
            <Select
              id="source-type"
              v-model="newSource.type"
              :options="sourceTypeOptions"
              optionLabel="label"
              optionValue="value"
              class="input-field"
            />
            <label for="source-type">Type</label>
          </FloatLabel>
          <div class="form-actions">
            <Button
              @click="addSource"
              label="Add"
              size="small"
            />
            <Button
              @click="cancelAdd"
              label="Cancel"
              severity="secondary"
              outlined
              size="small"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Sources List -->
    <div v-if="sources.length === 0 && !showAddForm" class="empty-state">
      No sources added yet
    </div>

    <div v-else class="sources-list">
      <Card
        v-for="source in sources"
        :key="source.name"
        @click="selectSource(source.name)"
        :class="['source-card', { 'source-card-selected': selectedSource?.name === source.name }]"
      >
        <template #content>
          <div class="source-content">
            <div class="source-info">
              <div class="source-header">
                <span class="source-name">{{ source.name }}</span>
                <span class="badge badge-type">{{ source.type }}</span>
                <span 
                  v-if="selectedSource?.name === source.name"
                  class="badge badge-active"
                >
                  Active
                </span>
              </div>
              <p class="source-url">{{ source.url }}</p>
            </div>
            <Button
              @click.stop="requestRemoveSource(source)"
              icon="pi pi-times"
              text
              rounded
              severity="secondary"
              size="small"
              title="Remove source"
            />
          </div>
        </template>
      </Card>
    </div>

    <ConfirmModal
      v-model:open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirmText="confirmButtonText"
      cancelText="Cancel"
      :destructive="isDestructive"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.source-manager {
  padding: 1rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0;
}

.add-form {
  margin-bottom: 0.75rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-field {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.form-actions button {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 1rem 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--p-surface-200);
}

.source-card:hover {
  border-color: var(--p-primary-color);
}

.source-card-selected {
  border-color: var(--p-primary-color);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.source-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.source-info {
  flex: 1;
  min-width: 0;
}

.source-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.source-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--p-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-url {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0.25rem 0 0 0;
}

.badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.badge-type {
  background: var(--p-primary-100);
  color: var(--p-primary-700);
}

.badge-active {
  background: var(--p-green-100);
  color: var(--p-green-700);
}
</style>
