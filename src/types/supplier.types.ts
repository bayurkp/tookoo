export interface Supplier {
  id: string; // UUID v4
  name: string; // Nama Vendor / Perusahaan Pemasok
  contactPerson?: string; // Nama PIC / Sales / Kontak
  phone: string; // No. Telepon / WhatsApp Sales
  email?: string;
  address?: string;
  suppliedItems?: string; // Keterangan barang yang disuplai (misal: "Biji Kopi, Sirup, Cup")
  paymentTerms?: string; // Termin bayar (misal: "COD / Tunai", "Tempo 14 Hari", "Transfer")
  notes?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}
