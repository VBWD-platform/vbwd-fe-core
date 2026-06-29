// UI Components
export { default as Alert } from './Alert.vue';
export { default as ApiKeysManager } from './ApiKeysManager.vue';
export { default as Badge } from './Badge.vue';
export { default as Button } from './Button.vue';
export { default as Card } from './Card.vue';
export { default as CouponInput } from './CouponInput.vue';
export { default as CustomFieldsDisplay } from './CustomFieldsDisplay.vue';
export { default as DetailField } from './DetailField.vue';
export { default as DetailGrid } from './DetailGrid.vue';
export { default as Dropdown } from './Dropdown.vue';
export { default as Icon } from './Icon.vue';
export { default as Input } from './Input.vue';
export { default as Modal } from './Modal.vue';
export { default as Pagination } from './Pagination.vue';
export { default as Spinner } from './Spinner.vue';
export { default as Table } from './Table.vue';
export { default as TagChips } from './TagChips.vue';

// Icon registry helpers (generic, domain-agnostic icon names)
export { ICON_PATHS, resolveIconPath, hasIcon } from './icons';

// Re-export types
export type {
  TableColumn,
  DropdownItem,
  ApiKey,
  ApiScope,
  TagChip,
  CustomFieldDef,
} from './types';
