// Store exports
export { useAuthStore, configureAuthStore } from './auth';
export type {
  AuthUser,
  AuthState,
  AuthStore,
  AuthStoreConfig,
  LoginCredentials,
  LoginResponse as AuthLoginResponse  // Renamed to avoid conflict with api/types.ts
} from './auth';

export { useCartStore, createCartStore } from './cart';
export type { ICartItem, CartItemType, CartItemInput } from './cart';
