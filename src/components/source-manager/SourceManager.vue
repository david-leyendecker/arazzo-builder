<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'
import ConfirmModal from '../common/ConfirmModal.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { floatLabelConfig } from '../../config/float-label.config'
import { SOURCE_MANAGER_CLASSES as CLASSES } from './source-manager-classes'
import { BUTTON_CLASSES } from '../common/ui-classes'

const workflowStore = useWorkflowStore()

const sources = computed(() => workflowStore.sourceDescriptions)
const selectedSource = computed(() => workflowStore.selectedSource)

const selectedSourceName = ref<string | null>(selectedSource.value?.name ?? null)
watch(
  () => selectedSource.value?.name,
  (name) => {
    selectedSourceName.value = name ?? null
  }
)

const selectedSourceOption = computed(() =>
  sources.value.find(source => source.name === selectedSourceName.value) || null
)

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formSource = ref({
  name: '',
  url: '',
  type: 'openapi' as 'openapi' | 'arazzo'
})
const editingSourceName = ref<string | null>(null)

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
    return `Delete source "${pendingRemoval.value.name}"? This action cannot be undone.`
  } else if (confirmationType.value === 'switch' && pendingSelection.value) {
    return 'Switching to a different source will clear your current workflow. Continue?'
  }
  return ''
})

const confirmTitle = computed(() => {
  return confirmationType.value === 'remove' ? 'Remove source?' : 'Switch source?'
})

const confirmButtonText = computed(() => {
  return confirmationType.value === 'remove' ? 'Delete' : 'Continue'
})

const isDestructive = computed(() => confirmationType.value === 'remove')

const resetForm = () => {
  formSource.value = { name: '', url: '', type: 'openapi' }
  editingSourceName.value = null
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (source: (typeof sources.value)[number]) => {
  dialogMode.value = 'edit'
  formSource.value = {
    name: source.name,
    url: source.url,
    type: source.type || 'openapi'
  }
  editingSourceName.value = source.name
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const addSource = (source: typeof formSource.value) => {
  workflowStore.addSourceDescription(source)
  selectedSourceName.value = source.name
}

const updateSource = (source: typeof formSource.value) => {
  if (!editingSourceName.value) return
  workflowStore.updateSourceDescription(editingSourceName.value, source)
}

const submitDialog = () => {
  const trimmed = {
    name: formSource.value.name.trim(),
    url: formSource.value.url.trim(),
    type: formSource.value.type
  }

  if (!trimmed.name || !trimmed.url) return

  if (dialogMode.value === 'add') {
    addSource(trimmed)
    workflowStore.selectSource(trimmed.name)
  } else {
    updateSource(trimmed)
  }

  dialogVisible.value = false
}

const removeSource = (name: string) => {
  workflowStore.removeSourceDescription(name)
}

const requestRemoveSource = (source: (typeof sources.value)[number]) => {
  pendingRemoval.value = source
  confirmationType.value = 'remove'
  confirmOpen.value = true
}

const triggerDeleteFromDialog = () => {
  const sourceName = editingSourceName.value
  if (!sourceName) return
  const source = sources.value.find(s => s.name === sourceName)
  if (!source) return
  requestRemoveSource(source)
}

const confirmRemoval = () => {
  if (!pendingRemoval.value) return
  removeSource(pendingRemoval.value.name)
  pendingRemoval.value = null
  dialogVisible.value = false
  confirmOpen.value = false
}

const cancelRemoval = () => {
  pendingRemoval.value = null
  confirmOpen.value = false
}

const selectSource = (sourceName: string | null) => {
  const currentName = workflowStore.selectedSource?.name ?? null
  if (!sourceName || sourceName === currentName) {
    selectedSourceName.value = currentName
    return
  }

  if (workflowStore.hasWorkflowData()) {
    pendingSelection.value = sourceName
    confirmationType.value = 'switch'
    confirmOpen.value = true
    selectedSourceName.value = currentName
    return
  }

  workflowStore.selectSource(sourceName)
}

const confirmSwitch = () => {
  if (!pendingSelection.value) return
  workflowStore.selectSource(pendingSelection.value)
  selectedSourceName.value = pendingSelection.value
  pendingSelection.value = null
  confirmOpen.value = false
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
</script>

<template>
  <div :class="CLASSES.root">
    <Select
      v-model="selectedSourceName"
      :options="sources"
      optionLabel="name"
      optionValue="name"
      placeholder="Select a source"
      :class="CLASSES.select"
      inputId="source-select"
      :disabled="sources.length === 0"
      @update:modelValue="selectSource"
    >
      <template #value="{ value, placeholder }">
        <div v-if="value && selectedSourceOption" :class="CLASSES.valueMain">
          <span :class="CLASSES.valueName">{{ selectedSourceOption.name }}</span>
          <Tag :value="selectedSourceOption.type" severity="info" />
        </div>
        <span v-else>{{ placeholder }}</span>
      </template>

      <template #option="{ option }">
        <div :class="CLASSES.optionRow">
          <div :class="CLASSES.optionText">
            <div :class="CLASSES.optionTitleRow">
              <span :class="CLASSES.optionName">{{ option.name }}</span>
              <Tag :value="option.type" severity="info" />
            </div>
            <div :class="CLASSES.optionUrl">{{ option.url }}</div>
          </div>
          <Button
            v-bind="BUTTON_CLASSES.editAction"
            @click.stop="openEditDialog(option)"
            aria-label="Edit source"
          />
        </div>
      </template>

      <template #footer>
        <div :class="CLASSES.selectFooter">
          <Button
            v-bind="BUTTON_CLASSES.addAction"
            label="Add Source"
            fluid
            variant="text"
            @click.stop="openAddDialog"
          />
        </div>
      </template>
    </Select>

    <div v-if="sources.length === 0" :class="CLASSES.emptyState">
      No sources added yet
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="dialogMode === 'add' ? 'Add Source' : 'Edit Source'"
      :style="{ width: '50vw' }"
    >
        <div :class="CLASSES.dialogFields">
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            id="dialog-source-name"
            v-model="formSource.name"
            class="w-full"
          />
          <label for="dialog-source-name">Source name</label>
        </FloatLabel>
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            id="dialog-source-url"
            v-model="formSource.url"
            class="w-full"
          />
          <label for="dialog-source-url">URL or path</label>
        </FloatLabel>
        <FloatLabel :variant="floatLabelConfig.variant">
          <Select
            id="dialog-source-type"
            v-model="formSource.type"
            :options="sourceTypeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
          <label for="dialog-source-type">Type</label>
        </FloatLabel>
      </div>

      <template #footer>
          <div :class="CLASSES.dialogFooter">
          <Button
            v-if="dialogMode === 'edit'"
            v-bind="BUTTON_CLASSES.deleteAction"
            label="Delete"
            @click="triggerDeleteFromDialog"
          />
            <div :class="CLASSES.dialogFooterRight">
            <Button
              v-bind="BUTTON_CLASSES.cancelAction"
              label="Cancel"
              @click="closeDialog"
            />
            <Button
              v-bind="BUTTON_CLASSES.confirmAction"
              :label="dialogMode === 'add' ? 'Add Source' : 'Save Changes'"
              @click="submitDialog"
            />
          </div>
        </div>
      </template>
    </Dialog>

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
  .source-dialog {
      width: 50vw;
  }
</style>