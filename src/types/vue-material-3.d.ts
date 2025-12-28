declare module 'vue-material-3' {
  import { DefineComponent } from 'vue'

  export const MdElevatedButton: DefineComponent<{
    label?: string
    disabled?: boolean
  }>

  export const MdFilledButton: DefineComponent<{
    label?: string
    disabled?: boolean
  }>

  export const MdTextButton: DefineComponent<{
    label?: string
    disabled?: boolean
  }>

  export const MdOutlinedButton: DefineComponent<{
    label?: string
    disabled?: boolean
  }>

  export const MdCard: DefineComponent<{}>

  export const MdIcon: DefineComponent<{
    icon?: string
  }>

  export const MdFab: DefineComponent<{
    icon?: string
    label?: string
  }>

  export const MdFabExtended: DefineComponent<{
    icon?: string
    label?: string
  }>

  export const MdOutlinedTextField: DefineComponent<{
    modelValue?: string
    label?: string
    placeholder?: string
    disabled?: boolean
    type?: string
  }>

  export const MdFilledTextField: DefineComponent<{
    modelValue?: string
    label?: string
    placeholder?: string
    disabled?: boolean
    type?: string
  }>

  export const MdNavigationDrawer: DefineComponent<{}>

  export const MdList: DefineComponent<{}>

  export const MdListItem: DefineComponent<{
    headline?: string
    supportingText?: string
  }>

  export const MdListDivider: DefineComponent<{}>

  export const MdIconButton: DefineComponent<{
    icon?: string
    disabled?: boolean
  }>

  export const MdCheckbox: DefineComponent<{
    modelValue?: boolean
    disabled?: boolean
  }>

  export const MdRadio: DefineComponent<{
    modelValue?: any
    value?: any
    name?: string
    disabled?: boolean
  }>

  export const MdChipSet: DefineComponent<{}>

  export const MdFilterChip: DefineComponent<{
    label?: string
    selected?: boolean
  }>

  export const MdSwitch: DefineComponent<{
    modelValue?: boolean
    disabled?: boolean
  }>

  export const MdBadge: DefineComponent<{
    value?: string | number
  }>

  export const MdDivider: DefineComponent<{}>

  export const MdLinearProgressIndicator: DefineComponent<{
    value?: number
    indeterminate?: boolean
  }>

  export const MdCircularProgressIndicator: DefineComponent<{
    value?: number
    indeterminate?: boolean
  }>

  export const MdAvatar: DefineComponent<{
    src?: string
    alt?: string
  }>

  export const MdSegmentedButton: DefineComponent<{
    label?: string
    selected?: boolean
  }>

  export const MdSegmentedButtonSet: DefineComponent<{}>

  export const MdDialog: DefineComponent<{
    open?: boolean
    onClosed?: () => void
  }>

  export const MdNavigationBar: DefineComponent<{}>

  export const MdNavigationTab: DefineComponent<{
    active?: boolean
    label?: string
  }>

  export const MdMenu: DefineComponent<{
    open?: boolean
    anchor?: HTMLElement | null
  }>

  export const MdSlider: DefineComponent<{
    modelValue?: number
    min?: number
    max?: number
    step?: number
  }>

  export const MdDatePicker: DefineComponent<{
    modelValue?: Date
  }>

  export const MdSnackbar: DefineComponent<{
    open?: boolean
    message?: string
  }>

  export const MdFilledAutoComplete: DefineComponent<{
    modelValue?: string
    label?: string
    options?: any[]
  }>

  export const MdOutlinedAutoComplete: DefineComponent<{
    modelValue?: string
    label?: string
    options?: any[]
  }>
}
