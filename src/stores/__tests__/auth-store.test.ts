import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().setRole('OWNER');
    useAuthStore.getState().lock();
  });

  it('allows all permissions when ownerPin is not configured', () => {
    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission('VIEW_REVENUE_REPORTS', false)).toBe(true);
    expect(hasPermission('MANAGE_PRODUCTS', false)).toBe(true);
  });

  it('allows all permissions when in OWNER role', () => {
    useAuthStore.getState().setRole('OWNER');
    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission('VIEW_REVENUE_REPORTS', true)).toBe(true);
    expect(hasPermission('MANAGE_PRODUCTS', true)).toBe(true);
  });

  it('restricts owner actions in CASHIER role when locked', () => {
    useAuthStore.getState().setRole('CASHIER');
    useAuthStore.getState().lock();
    const { hasPermission } = useAuthStore.getState();

    expect(hasPermission('VIEW_REVENUE_REPORTS', true)).toBe(false);
    expect(hasPermission('MANAGE_PRODUCTS', true)).toBe(false);
    expect(hasPermission('MANAGE_STORE_SETTINGS', true)).toBe(false);
  });

  it('allows actions in CASHIER role when temporarily unlocked with PIN', () => {
    useAuthStore.getState().setRole('CASHIER');
    useAuthStore.getState().unlock(15);
    const { hasPermission } = useAuthStore.getState();

    expect(hasPermission('VIEW_REVENUE_REPORTS', true)).toBe(true);
    expect(hasPermission('MANAGE_PRODUCTS', true)).toBe(true);
  });
});
