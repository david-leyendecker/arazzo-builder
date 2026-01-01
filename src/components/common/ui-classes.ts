// Shared UI class configurations (PrimeFlex + PrimeVue)
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
  exportAction: {
    icon: 'pi pi-download',
    size: 'small' as const,
  },
} as const
