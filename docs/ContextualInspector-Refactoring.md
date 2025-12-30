# ContextualInspector Refactoring

## Overview
Extracted recurring UI patterns from `ContextualInspector.vue` into reusable modular components to improve maintainability and reduce code duplication.

## New Components Created

### 1. SectionHeader.vue
**Purpose**: Displays a section title with an "Add" button.

**Props**:
- `label: string` - The section title

**Events**:
- `add` - Emitted when the add button is clicked

**Usage**:
```vue
<SectionHeader label="Parameters" @add="addParameter" />
```

### 2. KeyValueEditor.vue
**Purpose**: Generic key-value pair editor with add/remove functionality.

**Props**:
- `items: Record<string, any>` - The key-value pairs to edit
- `keyPlaceholder?: string` - Placeholder for the key input
- `valuePlaceholder?: string` - Placeholder for the value input

**Events**:
- `update:key` - `[oldKey: string, newKey: string]`
- `update:value` - `[key: string, value: any]`
- `remove` - `[key: string]`

**Usage**:
```vue
<KeyValueEditor
  :items="outputs"
  key-placeholder="Output name"
  value-placeholder="Expression"
  @update:key="updateKey"
  @update:value="updateValue"
  @remove="removeOutput"
/>
```

### 3. ParameterEditor.vue
**Purpose**: Edits Arazzo parameters with $ref support (for workflow-level parameters).

**Props**:
- `parameters: (ArazzoParameter | ArazzoReusableRef)[]`

**Events**:
- `toggle-ref` - `[index: number, useRef: boolean]`
- `update:field` - `[index: number, field: keyof ArazzoParameter, value: any]`
- `update:ref` - `[index: number, refValue: string]`
- `remove` - `[index: number]`

**Features**:
- Toggleable $ref mode for reusable parameters
- Dropdown for parameter location (path, query, header, cookie, body)
- Name and value inputs

### 4. SimpleParameterEditor.vue
**Purpose**: Simplified parameter editor without $ref support (for step-level parameters).

**Props**:
- `parameters: ArazzoParameter[]`

**Events**:
- `update:field` - `[index: number, field: keyof ArazzoParameter, value: any]`
- `remove` - `[index: number]`

**Features**:
- Same as ParameterEditor but without $ref toggle

### 5. StringListEditor.vue
**Purpose**: Edits a list of strings (used for success criteria, dependsOn).

**Props**:
- `items: string[]`
- `placeholder?: string`

**Events**:
- `update:item` - `[index: number, value: string]`
- `remove` - `[index: number]`

**Usage**:
```vue
<StringListEditor
  :items="successCriteria"
  placeholder="e.g., $statusCode == 200"
  @update:item="updateCriteria"
  @remove="removeCriteria"
/>
```

### 6. ActionEditor.vue
**Purpose**: Edits success/failure actions with $ref support.

**Props**:
- `actions: (Record<string, any> | ArazzoReusableRef)[]`

**Events**:
- `toggle-ref` - `[index: number, useRef: boolean]`
- `update:ref` - `[index: number, refValue: string]`
- `update:json` - `[index: number, value: string]`
- `remove` - `[index: number]`

**Features**:
- Toggleable $ref mode
- JSON textarea editor for action objects

## Benefits

1. **Reduced Code Duplication**: Common patterns like add/remove buttons, list items, and form fields are now centralized.

2. **Improved Maintainability**: Changes to UI patterns only need to be made in one place.

3. **Better Separation of Concerns**: Each component handles a specific UI pattern.

4. **Consistent Styling**: All similar UI elements now share the same styles.

5. **Easier Testing**: Smaller components are easier to test in isolation.

6. **Better Reusability**: These components can be used in other parts of the application.

## File Structure
```
src/components/inspector/
├── ActionEditor.vue
├── ContextualInspector.vue
├── KeyValueEditor.vue
├── ParameterEditor.vue
├── SectionHeader.vue
├── SimpleParameterEditor.vue
└── StringListEditor.vue
```

## Lines of Code Reduction
- **Before**: ~1050 lines in ContextualInspector.vue
- **After**: ~650 lines in ContextualInspector.vue + ~400 lines across 6 new components
- **Net Result**: Better organization with similar total lines but much better maintainability

## Testing
All existing tests pass without modification, confirming that the refactoring maintains existing functionality.
