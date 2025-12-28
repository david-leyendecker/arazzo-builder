<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import ConfirmModal from '../common/ConfirmModal.vue'
import MdTextButton from 'vue-material-3/src/components/button/MdTextButton.vue'
import MdFilledButton from 'vue-material-3/src/components/button/MdFilledButton.vue'
import MdOutlinedTextField from 'vue-material-3/src/components/text-field/MdOutlinedTextField.vue'
import MdCard from 'vue-material-3/src/components/card/MdCard.vue'
import MdBadge from 'vue-material-3/src/components/badge/MdBadge.vue'
import MdIconButton from 'vue-material-3/src/components/icon-button/MdIconButton.vue'

const workflowStore = useWorkflowStore()

const sources = computed(() => workflowStore.sourceDescriptions)
const selectedSource = computed(() => workflowStore.selectedSource)
const showAddForm = ref(false)
const newSource = ref({
  name: '',
  url: '',
  type: 'openapi' as 'openapi' | 'arazzo'
})

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
      <MdTextButton
        v-if="!showAddForm"
        @click="showAddForm = true"
        class="add-button"
      >
        + Add
      </MdTextButton>
    </div>

    <!-- Add Source Form -->
    <MdCard v-if="showAddForm" class="add-form-card">
      <div class="form-content">
        <MdOutlinedTextField
          v-model="newSource.name"
          label="Source name"
          class="form-field"
        />
        <MdOutlinedTextField
          v-model="newSource.url"
          label="URL or path"
          class="form-field"
        />
        <select
          v-model="newSource.type"
          class="type-select"
        >
          <option value="openapi">OpenAPI</option>
          <option value="arazzo">Arazzo</option>
        </select>
        <div class="form-actions">
          <MdFilledButton @click="addSource" class="flex-1">
            Add
          </MdFilledButton>
          <MdTextButton @click="cancelAdd" class="flex-1">
            Cancel
          </MdTextButton>
        </div>
      </div>
    </MdCard>

    <!-- Sources List -->
    <div v-if="sources.length === 0 && !showAddForm" class="empty-state">
      No sources added yet
    </div>

    <div v-else class="sources-list">
      <MdCard
        v-for="source in sources"
        :key="source.name"
        @click="selectSource(source.name)"
        class="source-card"
        :class="{ 'source-card-selected': selectedSource?.name === source.name }"
      >
        <div class="source-content">
          <div class="source-info">
            <div class="source-header">
              <span class="source-name">{{ source.name }}</span>
              <MdBadge class="source-type-badge">{{ source.type }}</MdBadge>
              <MdBadge 
                v-if="selectedSource?.name === source.name"
                class="active-badge"
              >
                Active
              </MdBadge>
            </div>
            <p class="source-url">{{ source.url }}</p>
          </div>
          <MdIconButton
            @click.stop="requestRemoveSource(source)"
            class="delete-button"
            title="Remove source"
          >
            ✕
          </MdIconButton>
        </div>
      </MdCard>
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
  color: var(--md-sys-color-on-surface);
}

.add-button {
  font-size: 0.875rem;
  color: var(--md-sys-color-primary);
}

.add-form-card {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: var(--md-sys-color-surface-variant);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-field {
  width: 100%;
}

.type-select {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 0.25rem;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

.type-select:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.flex-1 {
  flex: 1;
}

.empty-state {
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
  padding: 1rem 0;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-card {
  padding: 0.75rem;
  background-color: var(--md-sys-color-surface);
  border: 2px solid var(--md-sys-color-outline-variant);
  cursor: pointer;
  transition: all 0.2s;
}

.source-card:hover {
  border-color: var(--md-sys-color-primary);
}

.source-card-selected {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-primary-container);
}

.source-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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
  color: var(--md-sys-color-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-type-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-radius: 0.25rem;
}

.active-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-radius: 0.25rem;
}

.source-url {
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.25rem;
}

.delete-button {
  margin-left: 0.5rem;
  color: var(--md-sys-color-error);
}

.delete-button:hover {
  background-color: var(--md-sys-color-error-container);
}
</style>
