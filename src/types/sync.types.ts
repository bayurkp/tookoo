export type SyncAction = 'UPSERT' | 'DELETE' | 'FULL_SYNC_REQUEST' | 'FULL_SYNC_RESPONSE';

export interface SyncMessage<T = unknown> {
  action: SyncAction;
  collection: 'products' | 'orders' | 'settings';
  data: T;
  updatedAt: number;
  deviceId: string;
}

export interface PeerConnectionInfo {
  peerId: string;
  deviceName: string;
  connectedAt: number;
  status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
}

export interface StorePairingPayload {
  storeId: string;
  storeName: string;
  passphrase: string;
  timestamp: number;
}
