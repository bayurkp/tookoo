export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type TableShape = 'RECTANGLE' | 'SQUARE';

export interface StoreTable {
  id: string; // UUID v4
  name: string; // e.g. "Meja 01", "Meja 02", "VIP 1", "Bar 01"
  zone: string; // e.g. "Area Utama", "Lantai 1", "Outdoor Smoking", "VIP Room"
  x: number; // Grid X coordinate in px (snapped to 20px)
  y: number; // Grid Y coordinate in px (snapped to 20px)
  width: number; // Width in px (default: 100, min: 60, snapped to 20px)
  height: number; // Height in px (default: 80, min: 60, snapped to 20px)
  capacity: number; // Seat count (e.g. 2, 4, 6, 8)
  shape: TableShape;
  status: TableStatus;
  currentOrderId?: string | null; // Linked active pending order ID
  currentCustomerName?: string | null;
  activeOrderTotal?: number | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export const DEFAULT_STORE_ZONES = [
  'Area Indoor',
  'Area Outdoor',
  'Lantai 2',
  'Ruang VIP',
  'Area Bar / Kasir',
];
