import React, { useState } from 'react';
import {
  Cloud,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Loader2,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Save,
  LogOut,
  Settings2,
  UserCheck,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCloudBackup } from '../hooks/use-cloud-backup';
import {
  DEFAULT_CLOUD_BACKUP_CONFIG,
  type CloudBackupConfig,
  type AutoBackupInterval,
} from '@/types/cloud-backup.types';

export const CloudBackupCard: React.FC = () => {
  const {
    config = DEFAULT_CLOUD_BACKUP_CONFIG,
    isSyncing,
    isConnectingGoogle,
    connectGoogleDrive,
    disconnectGoogleDrive,
    googleDriveBackups,
    isLoadingGoogleDriveBackups,
    refetchGoogleDriveBackups,
    uploadGoogleDrive,
    isUploadingGoogleDrive,
    restoreGoogleDrive,
    isRestoringGoogleDrive,
    saveCloudBackupConfig,
  } = useCloudBackup();

  const [activeTab, setActiveTab] = useState<'gdrive' | 'schedule'>('gdrive');

  // Client ID input state (from config, env, or manual input)
  const defaultClientId =
    config?.googleDrive?.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [clientId, setClientId] = useState<string>(defaultClientId);
  const [showClientIdConfig, setShowClientIdConfig] = useState<boolean>(!defaultClientId);

  // Auto interval state
  const [autoInterval, setAutoInterval] = useState<AutoBackupInterval>(
    config?.autoBackupInterval || 'MANUAL_ONLY'
  );

  // Status notification
  const [notification, setNotification] = useState<{
    type: 'SUCCESS' | 'ERROR';
    message: string;
  } | null>(null);

  // Restore confirmation modal
  const [restoreFileId, setRestoreFileId] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string>('');

  const isDriveConnected = Boolean(config?.googleDrive?.accessToken);
  const connectedEmail = config?.googleDrive?.connectedEmail;
  const connectedName = config?.googleDrive?.connectedName;

  const handleConnectOAuth = async () => {
    if (!clientId.trim()) {
      setNotification({
        type: 'ERROR',
        message:
          'Harap masukkan Google Client ID terlebih dahulu sebelum menghubungkan akun Google.',
      });
      setShowClientIdConfig(true);
      return;
    }

    try {
      const res = await connectGoogleDrive(clientId.trim());
      setNotification({
        type: 'SUCCESS',
        message: `Berhasil terhubung ke akun Google: ${res.email || 'Akun Google'}`,
      });
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal menghubungkan akun Google.',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogleDrive();
      setNotification({
        type: 'SUCCESS',
        message: 'Koneksi akun Google Drive berhasil diputuskan.',
      });
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal memutuskan sambungan akun Google.',
      });
    }
  };

  const handleSaveSchedule = async () => {
    const updated: CloudBackupConfig = {
      ...config,
      autoBackupInterval: autoInterval,
      destinations: {
        googleDrive: isDriveConnected,
      },
    };

    await saveCloudBackupConfig(updated);
    setNotification({
      type: 'SUCCESS',
      message: 'Jadwal cadangan otomatis berhasil diperbarui.',
    });
  };

  const handleUploadNow = async () => {
    if (!isDriveConnected) {
      setNotification({
        type: 'ERROR',
        message: 'Hubungkan akun Google Drive Anda terlebih dahulu.',
      });
      return;
    }
    try {
      const res = await uploadGoogleDrive();
      setNotification({
        type: 'SUCCESS',
        message: `Berkas "${res.fileName}" berhasil dicadangkan ke Google Drive!`,
      });
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal mengunggah ke Google Drive.',
      });
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreFileId) return;
    try {
      const res = await restoreGoogleDrive(restoreFileId);
      setNotification({
        type: 'SUCCESS',
        message: `Pemulihan sukses! ${res.productsCount} produk dan ${res.ordersCount} transaksi berhasil dipulihkan.`,
      });
      setRestoreFileId(null);
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal memulihkan data dari Google Drive.',
      });
    }
  };

  return (
    <Card className="border bg-card rounded-xl shadow-none">
      <CardHeader className="p-5 pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Cadangan Awan & Pemulihan Google Drive
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Simpan salinan data toko ke akun Google Drive Anda secara sadar dan terjadwal otomatis.
              </CardDescription>
            </div>
          </div>

          {isDriveConnected && (
            <Button
              size="sm"
              onClick={handleUploadNow}
              disabled={isUploadingGoogleDrive || isSyncing}
              className="gap-2 text-xs font-bold shrink-0 cursor-pointer shadow-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploadingGoogleDrive || isSyncing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mencadangkan...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Cadangkan Sekarang</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`mx-5 mt-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            notification.type === 'SUCCESS'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'SUCCESS' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotification(null)}
            className="h-6 px-2 text-xs"
          >
            Tutup
          </Button>
        </div>
      )}

      <CardContent className="p-5">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="space-y-4"
        >
          <TabsList className="h-9 p-1 bg-muted/60">
            <TabsTrigger value="gdrive" className="gap-1.5 text-xs font-bold px-3 py-1">
              <HardDrive className="h-3.5 w-3.5 text-blue-500" />
              <span>Google Drive Cloud</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5 text-xs font-bold px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Jadwal Otomatis</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GOOGLE DRIVE (OAUTH 2.0) */}
          <TabsContent value="gdrive" className="space-y-4 m-0">
            <div className="p-4 bg-muted/20 border rounded-xl space-y-4">
              {/* CONNECTED STATE */}
              {isDriveConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-card border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/20">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {connectedName || 'Akun Google Terhubung'}
                          </span>
                          <Badge variant="default" className="text-[10px] bg-emerald-600 text-white font-bold">
                            OAuth Terverifikasi
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono block">
                          {connectedEmail || 'Email terhubung'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadNow}
                        disabled={isUploadingGoogleDrive}
                        className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        {isUploadingGoogleDrive ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>Unggah Cadangan</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDisconnect}
                        className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5 mr-1" />
                        <span>Putuskan</span>
                      </Button>
                    </div>
                  </div>

                  {/* List of backups on Google Drive */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">
                        Berkas Cadangan di Google Drive:
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchGoogleDriveBackups()}
                        disabled={isLoadingGoogleDriveBackups}
                        className="h-7 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${isLoadingGoogleDriveBackups ? 'animate-spin' : ''}`}
                        />
                        <span>Perbarui</span>
                      </Button>
                    </div>

                    {isLoadingGoogleDriveBackups ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-primary" />
                        <span>Memuat daftar berkas dari Google Drive...</span>
                      </div>
                    ) : googleDriveBackups.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic p-3 bg-card border rounded-lg">
                        Belum ada berkas cadangan Tookoo di Google Drive Anda.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {googleDriveBackups.map((file) => (
                          <div
                            key={file.id}
                            className="p-2.5 bg-card border rounded-lg flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-mono font-semibold text-foreground truncate block">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(file.createdTime).toLocaleString('id-ID')}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRestoreFileId(file.id);
                                setRestoreFileName(file.name);
                              }}
                              className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 cursor-pointer shrink-0"
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              Pulihkan Data
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* DISCONNECTED STATE */
                <div className="space-y-4">
                  <div className="p-4 bg-card border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-lg">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <HardDrive className="h-4 w-4 text-blue-500" />
                        <span>Otorisasi Akun Google (OAuth 2.0)</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Klik tombol untuk login dan memberikan izin akses Google Drive secara sadar. Tookoo
                        hanya akan mengakses dan menyimpan berkas cadangan yang dibuat oleh aplikasi ini.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleConnectOAuth}
                      disabled={isConnectingGoogle}
                      className="gap-2 text-xs font-bold shrink-0 cursor-pointer shadow-xs bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
                    >
                      {isConnectingGoogle ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Membuka Google OAuth...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                            />
                          </svg>
                          <span>Hubungkan Akun Google</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Client ID Setting Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowClientIdConfig(!showClientIdConfig)}
                      className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Settings2 className="h-3 w-3" />
                      <span>
                        {showClientIdConfig
                          ? 'Sembunyikan Pengaturan Google Client ID'
                          : 'Ubah Google OAuth Client ID'}
                      </span>
                    </button>

                    {showClientIdConfig && (
                      <div className="mt-2 p-3 bg-card border rounded-lg space-y-2 animate-in fade-in">
                        <Field>
                          <FieldLabel htmlFor="google-client-id-input" className="text-xs font-bold">
                            Google Cloud OAuth Client ID
                          </FieldLabel>
                          <Input
                            id="google-client-id-input"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="Contoh: 1234567890-abcdefg.apps.googleusercontent.com"
                            className="h-8 text-xs font-mono bg-background"
                          />
                          <FieldDescription>
                            Dibuat melalui Google Cloud Console (APIs & Services &gt; Credentials &gt; OAuth 2.0 Client IDs).
                          </FieldDescription>
                        </Field>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: JADWAL OTOMATIS */}
          <TabsContent value="schedule" className="space-y-4 m-0">
            <div className="p-4 bg-muted/20 border rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="cloud-auto-interval" className="text-xs font-bold">
                    Frekuensi Cadangan Otomatis
                  </FieldLabel>
                  <Select
                    value={autoInterval}
                    onValueChange={(val) => setAutoInterval(val as AutoBackupInterval)}
                  >
                    <SelectTrigger id="cloud-auto-interval" className="h-9 text-xs font-medium bg-background">
                      <SelectValue placeholder="Pilih Frekuensi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="MANUAL_ONLY">Hanya Pencadangan Manual</SelectItem>
                        <SelectItem value="EVERY_5_ORDERS">Setiap 5 Transaksi Selesai</SelectItem>
                        <SelectItem value="EVERY_10_ORDERS">Setiap 10 Transaksi Selesai</SelectItem>
                        <SelectItem value="EVERY_25_ORDERS">Setiap 25 Transaksi Selesai</SelectItem>
                        <SelectItem value="DAILY">Setiap Hari (Tutup Kasir)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Pencadangan akan otomatis berjalan di latar belakang saat kasir menyelesaikan penjualan.
                  </FieldDescription>
                </Field>

                <div className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold block">Status Tujuan</FieldLabel>
                  <div className="p-2.5 bg-card border rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Target Cadangan:</span>
                      <span className="font-bold text-foreground">Google Drive</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Status Koneksi:</span>
                      {isDriveConnected ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Terhubung
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          Belum Terhubung
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="pt-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Cadangan Terakhir:{' '}
                    <strong className="text-foreground">
                      {config?.lastBackupTimestamp
                        ? new Date(config.lastBackupTimestamp).toLocaleString('id-ID')
                        : 'Belum pernah'}
                    </strong>
                  </span>
                </div>
                {config?.lastBackupMessage && (
                  <Badge variant="outline" className="text-[10px]">
                    {config.lastBackupMessage}
                  </Badge>
                )}
              </div>

              {/* Save Settings Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveSchedule}
                  className="gap-2 text-xs font-bold cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Pengaturan Jadwal</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Confirmation Dialog for Restoring from Cloud */}
      <Dialog open={Boolean(restoreFileId)} onOpenChange={(open) => !open && setRestoreFileId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-emerald-600" />
              <span>Konfirmasi Pemulihan Data</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Apakah Anda yakin ingin memulihkan basis data dari berkas cadangan{' '}
              <strong className="text-foreground">{restoreFileName}</strong>? Data di perangkat ini
              akan disesuaikan dengan data cadangan tersebut.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRestoreFileId(null)}
              disabled={isRestoringGoogleDrive}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmRestore}
              disabled={isRestoringGoogleDrive}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isRestoringGoogleDrive ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Memulihkan...</span>
                </>
              ) : (
                <span>Ya, Pulihkan Data</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CloudBackupCard;
