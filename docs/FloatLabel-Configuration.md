# FloatLabel Configuration

## Overview

All form elements in the Arazzo Builder application now use PrimeVue's FloatLabel component with a globally configured variant.

## How to Change the FloatLabel Variant

To change the FloatLabel variant for the entire application, edit the configuration file:

**File**: [src/config/float-label.config.ts](../src/config/float-label.config.ts)

```typescript
export const floatLabelConfig = {
  variant: 'over' as 'over' | 'on' | 'in'
}
```

### Available Variants

- **`over`** (default) - Label floats over the input field
- **`on`** - Label appears on the border of the input field
- **`in`** - Label appears inside the input field

Simply change the `variant` value to one of these options, and the change will be applied to all form elements throughout the application.

## Components Using FloatLabel

The following components have been updated to use the global FloatLabel configuration:

### ContextualInspector
- Workflow Summary (InputText)
- Workflow Description (Textarea)
- Workflow Inputs/JSON Schema (Textarea)
- Step ID (InputText, readonly)
- Operation ID (AutoComplete)
- Step Description (Textarea)
- Request Body JSON (Textarea)

### SourceManager
- Source name (InputText)
- URL or path (InputText)
- Type (Select)

### ActionEditor
- Action reference/$ref (InputText)
- Action JSON (Textarea)

### ParameterEditor
- Parameter reference/$ref (InputText)
- Parameter name (InputText)
- Parameter location (Select)
- Parameter value (InputText)

### SimpleParameterEditor
- Parameter name (InputText)
- Parameter location (Select)
- Parameter value (InputText)

### StringListEditor
- String list items (InputText)

### KeyValueEditor
- Key field (InputText)
- Value field (InputText)

## Technical Details

- FloatLabel is registered globally in [src/main.ts](../src/main.ts)
- The configuration is imported and used in all form components
- Each input has a unique `id` attribute that corresponds to its FloatLabel's `for` attribute
- The variant is applied consistently using `:variant="floatLabelConfig.variant"`

## Example

Before (without FloatLabel):
```vue
<InputText
  :value="name"
  placeholder="Name"
/>
```

After (with FloatLabel):
```vue
<FloatLabel :variant="floatLabelConfig.variant">
  <InputText
    id="name-field"
    :value="name"
  />
  <label for="name-field">Name</label>
</FloatLabel>
```
