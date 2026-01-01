import { INSPECTOR_CLASSES, TEXT_CLASSES } from '../inspector/inspector-classes'

export const SOURCE_MANAGER_CLASSES = {
  root: 'flex flex-column',
  header: 'flex align-items-start justify-content-between gap-3',
  headerText: 'flex flex-column gap-1',
  title: 'text-lg font-semibold text-color m-0',
  subtitle: `m-0 ${TEXT_CLASSES.small} ${TEXT_CLASSES.secondary}`,

  select: 'w-full',
  valueContainer: 'flex flex-column gap-1 overflow-hidden',
  valueMain: 'flex align-items-center gap-2 min-w-0',
  valueName: 'font-semibold text-color text-overflow-ellipsis white-space-nowrap',
  valueUrl: 'text-sm text-color-secondary text-overflow-ellipsis white-space-nowrap',

  optionRow: 'flex align-items-center justify-content-between gap-3 w-full',
  optionText: 'flex flex-column gap-1 min-w-0',
  optionTitleRow: 'flex align-items-center gap-2 min-w-0',
  optionName: 'font-semibold text-overflow-ellipsis white-space-nowrap',
  optionUrl: 'text-sm text-color-secondary text-overflow-ellipsis white-space-nowrap',

  selectHeader: 'px-3 py-2 font-semibold text-color',
  selectFooter: 'p-2',
  emptyState: 'text-center text-sm text-color-secondary py-2',

  dialogFields: INSPECTOR_CLASSES.fieldGroup,
  dialogFooter: 'flex align-items-center gap-2 w-full',
  dialogFooterRight: 'flex gap-2 ml-auto'
} as const
