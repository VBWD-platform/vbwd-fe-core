// Shared types for UI components

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface DropdownItem {
  label: string;
  value: unknown;
  disabled?: boolean;
}

// API-key management (S52) — shared by the ApiKeysManager component and the
// admin / user apps that wire it to their own stores.
export interface ApiKey {
  id: string;
  label: string;
  key_prefix: string;
  scopes: string[];
  ip_whitelist: string[];
  is_active: boolean;
  last_used_at?: string | null;
}

export interface ApiScope {
  key: string;
  label: string;
  description?: string;
  user_grantable?: boolean;
}

// Tags & custom fields read-only display (S77) — shared by fe-user cards and
// fe-admin detail pages. Cards read the `tags` / `custom_fields` keys already on
// the serialized payload; `CustomFieldDef` supplies labels + types for display.
export interface TagChip {
  slug: string;
  name?: string;
  color?: string | null;
}

export interface CustomFieldDef {
  key: string;
  label: string;
  type: string;
  options?: unknown;
  sort_order?: number;
}
