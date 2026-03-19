/**
 * Cart item types following Liskov Substitution Principle
 * Any item type can be substituted without breaking cart behavior
 */
export type CartItemType = 'PLAN' | 'TOKEN_BUNDLE' | 'ADD_ON';
/**
 * Interface for cart items - extensible via metadata
 */
export interface ICartItem {
    type: CartItemType;
    id: string;
    name: string;
    price: number;
    quantity: number;
    metadata?: Record<string, unknown>;
}
/**
 * Input type for adding items (quantity is set automatically)
 */
export type CartItemInput = Omit<ICartItem, 'quantity'>;
/**
 * Shopping Cart Store
 *
 * Features:
 * - Add/remove/update items
 * - Automatic quantity handling
 * - localStorage persistence
 * - Computed totals
 *
 * Usage:
 * ```typescript
 * import { useCartStore } from '@vbwd/view-component';
 *
 * const cart = useCartStore();
 * cart.addItem({ type: 'TOKEN_BUNDLE', id: '1', name: '1000 Tokens', price: 10 });
 * console.log(cart.total); // 10
 * ```
 */
export declare const useCartStore: import("pinia").StoreDefinition<"cart", Pick<{
    items: import("vue").Ref<{
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[], ICartItem[] | {
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[]>;
    itemCount: import("vue").ComputedRef<number>;
    total: import("vue").ComputedRef<number>;
    isEmpty: import("vue").ComputedRef<boolean>;
    addItem: (input: CartItemInput) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getItemById: (id: string) => ICartItem | undefined;
    getItemsByType: (type: CartItemType) => ICartItem[];
}, "items">, Pick<{
    items: import("vue").Ref<{
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[], ICartItem[] | {
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[]>;
    itemCount: import("vue").ComputedRef<number>;
    total: import("vue").ComputedRef<number>;
    isEmpty: import("vue").ComputedRef<boolean>;
    addItem: (input: CartItemInput) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getItemById: (id: string) => ICartItem | undefined;
    getItemsByType: (type: CartItemType) => ICartItem[];
}, "itemCount" | "total" | "isEmpty">, Pick<{
    items: import("vue").Ref<{
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[], ICartItem[] | {
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[]>;
    itemCount: import("vue").ComputedRef<number>;
    total: import("vue").ComputedRef<number>;
    isEmpty: import("vue").ComputedRef<boolean>;
    addItem: (input: CartItemInput) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getItemById: (id: string) => ICartItem | undefined;
    getItemsByType: (type: CartItemType) => ICartItem[];
}, "addItem" | "removeItem" | "updateQuantity" | "clearCart" | "getItemById" | "getItemsByType">>;
/**
 * Factory function for creating custom cart stores
 * Useful for DI and testing
 */
export declare function createCartStore(storageKey?: string): import("pinia").StoreDefinition<`cart-${string}`, Pick<{
    items: import("vue").Ref<{
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[], ICartItem[] | {
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[]>;
    itemCount: import("vue").ComputedRef<number>;
    total: import("vue").ComputedRef<number>;
    isEmpty: import("vue").ComputedRef<boolean>;
    addItem: (input: CartItemInput) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}, "items">, Pick<{
    items: import("vue").Ref<{
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[], ICartItem[] | {
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[]>;
    itemCount: import("vue").ComputedRef<number>;
    total: import("vue").ComputedRef<number>;
    isEmpty: import("vue").ComputedRef<boolean>;
    addItem: (input: CartItemInput) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}, "itemCount" | "total" | "isEmpty">, Pick<{
    items: import("vue").Ref<{
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[], ICartItem[] | {
        type: CartItemType;
        id: string;
        name: string;
        price: number;
        quantity: number;
        metadata?: Record<string, unknown> | undefined;
    }[]>;
    itemCount: import("vue").ComputedRef<number>;
    total: import("vue").ComputedRef<number>;
    isEmpty: import("vue").ComputedRef<boolean>;
    addItem: (input: CartItemInput) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}, "addItem" | "removeItem" | "updateQuantity" | "clearCart">>;
//# sourceMappingURL=cart.d.ts.map