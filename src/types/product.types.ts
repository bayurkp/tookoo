export interface Product {
  id: string; // UUID v4
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: number; // Timestamp ms
  updatedAt: number; // Timestamp ms
  deletedAt: number | null; // null if active, timestamp if soft deleted
}
