import { create } from 'zustand';
import type { UserRole, AppPermission } from '@/types/store.types';

interface AuthState {
  currentRole: UserRole;
  isUnlocked: boolean;
  unlockedUntil: number | null; // Timestamp ms
  setRole: (role: UserRole) => void;
  unlock: (durationMinutes?: number) => void;
  lock: () => void;
  hasPermission: (permission: AppPermission, ownerPinConfigured: boolean) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentRole: 'OWNER',
  isUnlocked: false,
  unlockedUntil: null,

  setRole: (role: UserRole) => {
    set({ currentRole: role, isUnlocked: role === 'OWNER' });
  },

  unlock: (durationMinutes = 15) => {
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    set({ isUnlocked: true, unlockedUntil: expiresAt });
  },

  lock: () => {
    set({ isUnlocked: false, unlockedUntil: null });
  },

  hasPermission: (permission: AppPermission, ownerPinConfigured: boolean) => {
    const { currentRole, isUnlocked, unlockedUntil } = get();

    // If no PIN is configured on the store, grant all permissions
    if (!ownerPinConfigured) {
      return true;
    }

    // If active role is OWNER and not locked
    if (currentRole === 'OWNER') {
      return true;
    }

    // Check temporary unlock session expiry
    if (isUnlocked && unlockedUntil && Date.now() < unlockedUntil) {
      return true;
    }

    // Permissions allowed for standard Cashier staff
    switch (permission) {
      case 'VIEW_REVENUE_REPORTS':
      case 'MANAGE_PRODUCTS':
      case 'MANAGE_STORE_SETTINGS':
      case 'MANAGE_PEERS':
      case 'EXPORT_DATABASE':
      case 'RESET_STORE':
        return false;
      default:
        return true;
    }
  },
}));
