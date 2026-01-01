/**
 * Centralized CSS class configurations for inspector-v2 components
 * Uses PrimeFlex utilities and PrimeVue design tokens
 */

// Container Classes
export const INSPECTOR_CLASSES = {
  // Main Containers
  root: 'flex flex-column h-full overflow-y-auto p-3 gap-3',
  content: 'flex flex-column gap-3',

  // Headers
  header: 'flex align-items-center justify-content-between',
  title: 'm-0 text-xl font-semibold',
  sectionHeader: 'flex align-items-center justify-content-between w-full pr-3',
  badgeRow: 'flex align-items-center gap-2',
  
  // Form Fields
  fieldGroup: 'flex flex-column gap-3',
  fieldRow: 'flex align-items-center gap-2',
  inlineLabel: 'flex align-items-center gap-2',
  
  // Items/Lists
  itemContainer: 'surface-50 border-round p-3 border-1 surface-border',
  itemList: 'flex flex-column gap-3',
  itemHeader: 'flex align-items-start gap-2 mb-3',
  itemContent: 'flex flex-column gap-3',
  
  // Flow Control
  flowCardSuccess: 'surface-card border-1 border-green-500',
  flowCardFailure: 'surface-card border-1 border-red-500',
  flowContent: 'flex align-items-center gap-2 p-2',
  
  // Utility
  flex1: 'flex-1',
  fontMono: 'font-mono text-sm',
  
  // Empty States
  emptyStateContainer: 'flex flex-column align-items-center gap-3 py-4',
  emptyStateIcon: 'pi pi-info-circle text-5xl text-color-secondary',
  emptyStateText: 'text-color-secondary m-0',
  
  // Spacing
  mt2: 'mt-2',
  mt3: 'mt-3',
  mb0: 'mb-0',
  mb3: 'mb-3',
  pl4: 'pl-4',
  
  // Accordion
  accordionValue: [] as string[],
  accordionMultiple: true,
} as const

// Button Configurations
export const BUTTON_CLASSES = {
  addAction: {
    icon: 'pi pi-plus',
    text: true,
    rounded: true,
    size: 'small' as const,
    severity: 'secondary' as const,
  },
  removeAction: {
    icon: 'pi pi-times',
    text: true,
    rounded: true,
    severity: 'danger' as const,
    size: 'small' as const,
  },
} as const

// Icon Classes
export const ICON_CLASSES = {
  spinner: 'pi pi-spin pi-spinner mr-2',
  arrowRight: 'pi pi-arrow-right',
  arrowRightSuccess: 'pi pi-arrow-right text-green-600',
  arrowRightFailure: 'pi pi-arrow-right text-red-600',
} as const

// Message Severities
export const MESSAGE_SEVERITY = {
  error: 'error' as const,
  success: 'success' as const,
  info: 'info' as const,
  warn: 'warn' as const,
} as const

// Common Text Classes
export const TEXT_CLASSES = {
  semibold: 'font-semibold',
  small: 'text-sm',
  secondary: 'text-color-secondary',
  block: 'block',
} as const
