export type SyncAction = 'UPSERT' | 'DELETE';

export interface SyncMessage<T = unknown> {
  action: SyncAction;
  collection: 'products' | 'orders' | 'settings';
  data: T;
  updatedAt: number;
  deviceId: string;
}
