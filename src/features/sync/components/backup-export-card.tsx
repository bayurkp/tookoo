import React, { useRef, useState } from 'react';
import { Download, Upload, Database, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DatabaseBackup } from '../api/sync-engine';

interface BackupExportCardProps {
  onExport: () => void;
  onImport: (
    backupData: DatabaseBackup
  ) => Promise<{ productsCount: number; ordersCount: number }>;
}

export const BackupExportCard: React.FC<BackupExportCardProps> = ({
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text) as DatabaseBackup;
      const res = await onImport(backupData);
      setImportStatus(
        `Sukses memulihkan ${res.productsCount} produk dan ${res.ordersCount} transaksi.`
      );
      setTimeout(() => setImportStatus(null), 5000);
    } catch {
      setImportStatus('Gagal membaca berkas cadangan. Format JSON tidak valid.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              Cadangan & Pemulihan Data (Offline Backup)
            </CardTitle>
            <CardDescription className="text-xs">
              Simpan berkas master produk dan riwayat transaksi ke penyimpanan lokal.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onExport}
            className="h-10 text-xs font-bold gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Cadangan (JSON)</span>
          </Button>

          {/* Import Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-10 text-xs font-bold gap-2"
            >
              <Upload className="h-4 w-4" />
              <span>Pulihkan dari File</span>
            </Button>
          </div>
        </div>

        {importStatus && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
