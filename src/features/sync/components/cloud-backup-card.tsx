import React, { useState } from 'react';
import {
  Cloud,
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  RefreshCw,
  Loader2,
  HardDrive,
  MessageSquare,
  Radio,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
    googleDriveBackups,
    isLoadingGoogleDriveBackups,
    refetchGoogleDriveBackups,
    uploadGoogleDrive,
    isUploadingGoogleDrive,
    restoreGoogleDrive,
    isRestoringGoogleDrive,
    testTelegram,
    isTestingTelegram,
    sendTelegram,
    isSendingTelegram,
    testDiscord,
    isTestingDiscord,
    sendDiscord,
    isSendingDiscord,
    saveCloudBackupConfig,
    runCloudBackupNow,
  } = useCloudBackup();

  const [activeTab, setActiveTab] = useState<'schedule' | 'gdrive' | 'telegram' | 'discord'>(
    'schedule'
  );

  // Local Form state for Settings
  const [autoInterval, setAutoInterval] = useState<AutoBackupInterval>(
    config?.autoBackupInterval || 'MANUAL_ONLY'
  );
  const [destGoogleDrive, setDestGoogleDrive] = useState<boolean>(
    Boolean(config?.destinations?.googleDrive)
  );
  const [destTelegram, setDestTelegram] = useState<boolean>(
    Boolean(config?.destinations?.telegram)
  );
  const [destDiscord, setDestDiscord] = useState<boolean>(Boolean(config?.destinations?.discord));

  // Google Drive state
  const [gdriveToken, setGdriveToken] = useState(config?.googleDrive?.accessToken || '');

  // Telegram state
  const [tgToken, setTgToken] = useState(config?.telegram?.botToken || '');
  const [tgChatId, setTgChatId] = useState(config?.telegram?.chatId || '');

  // Discord state
  const [discordWebhook, setDiscordWebhook] = useState(config?.discord?.webhookUrl || '');

  // Status feedback
  const [notification, setNotification] = useState<{
    type: 'SUCCESS' | 'ERROR';
    message: string;
  } | null>(null);

  // Restore confirmation modal
  const [restoreFileId, setRestoreFileId] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string>('');

  const handleSaveSettings = async () => {
    const updated: CloudBackupConfig = {
      autoBackupInterval: autoInterval,
      destinations: {
        googleDrive: destGoogleDrive,
        telegram: destTelegram,
        discord: destDiscord,
      },
      googleDrive: {
        accessToken: gdriveToken.trim() || undefined,
      },
      telegram: {
        botToken: tgToken.trim() || undefined,
        chatId: tgChatId.trim() || undefined,
        enabled: destTelegram,
      },
      discord: {
        webhookUrl: discordWebhook.trim() || undefined,
        enabled: destDiscord,
      },
      lastBackupTimestamp: config?.lastBackupTimestamp,
      lastBackupStatus: config?.lastBackupStatus,
      lastBackupMessage: config?.lastBackupMessage,
      ordersCountAtLastBackup: config?.ordersCountAtLastBackup,
    };

    await saveCloudBackupConfig(updated);
    setNotification({
      type: 'SUCCESS',
      message: 'Pengaturan cadangan awan & jadwal berhasil disimpan.',
    });
  };

  const handleTestTelegram = async () => {
    if (!tgToken.trim() || !tgChatId.trim()) {
      setNotification({
        type: 'ERROR',
        message: 'Harap isi Bot Token dan Chat ID Telegram terlebih dahulu.',
      });
      return;
    }
    try {
      await testTelegram({ botToken: tgToken.trim(), chatId: tgChatId.trim() });
      setNotification({
        type: 'SUCCESS',
        message: 'Uji koneksi Telegram berhasil! Pesan konfirmasi telah dikirim.',
      });
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal terhubung ke bot Telegram.',
      });
    }
  };

  const handleSendTelegramNow = async () => {
    if (!tgToken.trim() || !tgChatId.trim()) {
      setNotification({
        type: 'ERROR',
        message: 'Harap isi Bot Token dan Chat ID Telegram.',
      });
      return;
    }
    try {
      await sendTelegram({ botToken: tgToken.trim(), chatId: tgChatId.trim() });
      setNotification({
        type: 'SUCCESS',
        message: 'Berkas cadangan .json berhasil dikirim ke Telegram!',
      });
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal mengirim berkas ke Telegram.',
      });
    }
  };

  const handleTestDiscord = async () => {
    if (!discordWebhook.trim()) {
      setNotification({
        type: 'ERROR',
        message: 'Harap isi URL Webhook Discord terlebih dahulu.',
      });
      return;
    }
    try {
      await testDiscord(discordWebhook.trim());
      setNotification({
        type: 'SUCCESS',
        message: 'Uji webhook Discord berhasil! Notifikasi telah muncul di channel.',
      });
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal mengirim pesan uji ke Discord.',
      });
    }
  };

  const handleSendDiscordNow = async () => {
    if (!discordWebhook.trim()) {
      setNotification({
        type: 'ERROR',
        message: 'Harap isi URL Webhook Discord.',
      });
      return;
    }
    try {
      await sendDiscord(discordWebhook.trim());
      setNotification({
        type: 'SUCCESS',
        message: 'Berkas cadangan .json dan ringkasan data berhasil dikirim ke Discord!',
      });
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal mengirim ke Discord.',
      });
    }
  };

  const handleUploadGDrive = async () => {
    if (!gdriveToken.trim()) {
      setNotification({
        type: 'ERROR',
        message: 'Akses token Google Drive belum diisi.',
      });
      return;
    }
    try {
      const res = await uploadGoogleDrive();
      setNotification({
        type: 'SUCCESS',
        message: `Berkas cadangan "${res.fileName}" berhasil diunggah ke Google Drive!`,
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
        message: `Pemulihan selesai! ${res.productsCount} produk dan ${res.ordersCount} transaksi berhasil dipulihkan.`,
      });
      setRestoreFileId(null);
    } catch (err: any) {
      setNotification({
        type: 'ERROR',
        message: err.message || 'Gagal memulihkan cadangan dari Google Drive.',
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
                Cadangan Awan & Pemulihan (Cloud Backup & Recovery)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Simpan dan pulihkan data toko otomatis ke Google Drive, Bot Telegram, dan Discord
                Channel.
              </CardDescription>
            </div>
          </div>

          <Button
            size="sm"
            onClick={runCloudBackupNow}
            disabled={isSyncing}
            className="gap-2 text-xs font-bold shrink-0 cursor-pointer shadow-xs"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Mencadangkan...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Cadangkan ke Semua Cloud</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Notification banner */}
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
            <TabsTrigger value="schedule" className="gap-1.5 text-xs font-bold px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Jadwal Otomatis</span>
            </TabsTrigger>
            <TabsTrigger value="gdrive" className="gap-1.5 text-xs font-bold px-3 py-1">
              <HardDrive className="h-3.5 w-3.5 text-blue-500" />
              <span>Google Drive</span>
            </TabsTrigger>
            <TabsTrigger value="telegram" className="gap-1.5 text-xs font-bold px-3 py-1">
              <Send className="h-3.5 w-3.5 text-sky-500" />
              <span>Telegram Bot</span>
            </TabsTrigger>
            <TabsTrigger value="discord" className="gap-1.5 text-xs font-bold px-3 py-1">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
              <span>Discord Webhook</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: JADWAL OTOMATIS */}
          <TabsContent value="schedule" className="space-y-4 m-0">
            <div className="p-4 bg-muted/20 border rounded-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="cloud-auto-interval" className="text-xs font-bold">Frekuensi Cadangan Otomatis</FieldLabel>
                  <Select
                    value={autoInterval}
                    onValueChange={(val) => setAutoInterval(val as AutoBackupInterval)}
                  >
                    <SelectTrigger id="cloud-auto-interval" className="h-9 text-xs font-medium">
                      <SelectValue placeholder="Pilih Frekuensi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="MANUAL_ONLY">Hanya Pencadangan Manual</SelectItem>
                        <SelectItem value="EVERY_5_ORDERS">Setiap 5 Transaksi Selesai</SelectItem>
                        <SelectItem value="EVERY_10_ORDERS">Setiap 10 Transaksi Selesai</SelectItem>
                        <SelectItem value="EVERY_25_ORDERS">Setiap 25 Transaksi Selesai</SelectItem>
                        <SelectItem value="DAILY">Setiap Hari (Harian / Tutup Kasir)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <div>
                  <FieldLabel className="text-xs font-bold block mb-2">
                    Target Otomatis Cloud
                  </FieldLabel>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="dest-gdrive"
                        checked={destGoogleDrive}
                        onCheckedChange={(c) => setDestGoogleDrive(Boolean(c))}
                      />
                      <label htmlFor="dest-gdrive" className="text-xs font-medium cursor-pointer">
                        Google Drive
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="dest-telegram"
                        checked={destTelegram}
                        onCheckedChange={(c) => setDestTelegram(Boolean(c))}
                      />
                      <label htmlFor="dest-telegram" className="text-xs font-medium cursor-pointer">
                        Telegram Bot
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="dest-discord"
                        checked={destDiscord}
                        onCheckedChange={(c) => setDestDiscord(Boolean(c))}
                      />
                      <label htmlFor="dest-discord" className="text-xs font-medium cursor-pointer">
                        Discord Webhook
                      </label>
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
            </div>
          </TabsContent>

          {/* TAB 2: GOOGLE DRIVE */}
          <TabsContent value="gdrive" className="space-y-4 m-0">
            <div className="p-4 bg-muted/20 border rounded-xl space-y-4">
              <div className="space-y-2">
                <Field>
                  <FieldLabel htmlFor="cloud-gdrive-token" className="text-xs font-bold">
                    Google Drive OAuth Access Token / API Key
                  </FieldLabel>
                  <Input
                    id="cloud-gdrive-token"
                    value={gdriveToken}
                    onChange={(e) => setGdriveToken(e.target.value)}
                    placeholder="Masukkan Google OAuth 2.0 Bearer Access Token..."
                    className="h-9 text-xs font-mono"
                  />
                  <FieldDescription>
                    Dapat diperoleh dari Google Cloud Console atau integrasi Google Identity
                    Services.
                  </FieldDescription>
                </Field>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={handleUploadGDrive}
                    disabled={isUploadingGoogleDrive || !gdriveToken.trim()}
                    className="h-8 text-xs font-bold gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploadingGoogleDrive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>Unggah Cadangan ke Google Drive</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchGoogleDriveBackups()}
                    disabled={isLoadingGoogleDriveBackups || !gdriveToken.trim()}
                    className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Perbarui Daftar Cadangan</span>
                  </Button>
                </div>
              </div>

              {/* Backups List on Google Drive */}
              {gdriveToken.trim() && (
                <div className="pt-3 border-t space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Berkas Cadangan di Google Drive:</span>
                    <span className="text-muted-foreground text-[11px] font-normal">
                      {googleDriveBackups.length} Berkas Ditemukan
                    </span>
                  </h4>

                  {isLoadingGoogleDriveBackups ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                      <span>Memuat daftar dari Google Drive...</span>
                    </div>
                  ) : googleDriveBackups.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic p-3 bg-card border rounded-lg">
                      Belum ada berkas cadangan Tookoo di Google Drive ini.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
              )}
            </div>
          </TabsContent>

          {/* TAB 3: TELEGRAM BOT */}
          <TabsContent value="telegram" className="space-y-4 m-0">
            <div className="p-4 bg-muted/20 border rounded-xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="cloud-tg-token" className="text-xs font-bold">Telegram Bot Token *</FieldLabel>
                  <Input
                    id="cloud-tg-token"
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    placeholder="Contoh: 123456789:ABCdefGhIJKlmNoPQR..."
                    className="h-9 text-xs font-mono"
                  />
                  <FieldDescription>
                    Dibuat via @BotFather di aplikasi Telegram.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="cloud-tg-chat-id" className="text-xs font-bold">Chat ID / Channel ID *</FieldLabel>
                  <Input
                    id="cloud-tg-chat-id"
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    placeholder="Contoh: 987654321 atau @nama_channel"
                    className="h-9 text-xs font-mono"
                  />
                  <FieldDescription>
                    ID obrolan pribadi atau grup/channel kasir Anda.
                  </FieldDescription>
                </Field>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestTelegram}
                  disabled={isTestingTelegram || !tgToken.trim() || !tgChatId.trim()}
                  className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
                >
                  {isTestingTelegram ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Radio className="h-3.5 w-3.5 text-sky-500" />
                  )}
                  <span>Uji Pesan Telegram</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleSendTelegramNow}
                  disabled={isSendingTelegram || !tgToken.trim() || !tgChatId.trim()}
                  className="h-8 text-xs font-bold gap-1.5 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {isSendingTelegram ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Kirim Berkas Cadangan ke Telegram</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: DISCORD WEBHOOK */}
          <TabsContent value="discord" className="space-y-4 m-0">
            <div className="p-4 bg-muted/20 border rounded-xl space-y-3">
              <Field>
                <FieldLabel htmlFor="cloud-discord-webhook" className="text-xs font-bold">Discord Channel Webhook URL *</FieldLabel>
                <Input
                  id="cloud-discord-webhook"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="Contoh: https://discord.com/api/webhooks/1234567890/abcDEF..."
                  className="h-9 text-xs font-mono"
                />
                <FieldDescription>
                  Dibuat dari Server Discord → Edit Channel → Integrations → Webhooks.
                </FieldDescription>
              </Field>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestDiscord}
                  disabled={isTestingDiscord || !discordWebhook.trim()}
                  className="h-8 text-xs font-bold gap-1.5 cursor-pointer"
                >
                  {isTestingDiscord ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Radio className="h-3.5 w-3.5 text-indigo-500" />
                  )}
                  <span>Uji Webhook Discord</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleSendDiscordNow}
                  disabled={isSendingDiscord || !discordWebhook.trim()}
                  className="h-8 text-xs font-bold gap-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSendingDiscord ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5" />
                  )}
                  <span>Kirim Berkas Cadangan ke Discord</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="p-5 pt-0 border-t flex justify-end">
        <Button
          size="sm"
          onClick={handleSaveSettings}
          className="text-xs font-bold gap-1.5 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Simpan Konfigurasi Cloud</span>
        </Button>
      </CardFooter>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreFileId !== null}
        onOpenChange={(open) => !open && setRestoreFileId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Pulihkan Data dari Google Drive?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Memulihkan data dari berkas{' '}
              <strong className="text-foreground">{restoreFileName}</strong>. Data yang memiliki cap
              waktu lebih baru akan diperbarui ke basis data toko Anda.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRestoreFileId(null)}
              disabled={isRestoringGoogleDrive}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmRestore}
              disabled={isRestoringGoogleDrive}
              className="text-xs font-bold gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isRestoringGoogleDrive ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Memulihkan...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Konfirmasi & Pulihkan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CloudBackupCard;
