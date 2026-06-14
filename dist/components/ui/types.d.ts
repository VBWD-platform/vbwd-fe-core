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
//# sourceMappingURL=types.d.ts.map