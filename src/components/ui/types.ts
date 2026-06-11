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
