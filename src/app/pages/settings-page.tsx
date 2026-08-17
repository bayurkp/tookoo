import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Palette,
  Languages,
  Smartphone,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Printer,
  HardDrive,
  CheckCircle2,
  Volume1,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { useTheme } from '@/hooks/use-theme';
import { sounds } from '@/utils/audio';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, isSettingsLoading, updateSettings } = useP2pSync();
  const { theme, setTheme } = useTheme();

  // Form local state
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [defaultCashier, setDefaultCashier] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setStoreAddress(settings.storeAddress || '');
      setReceiptFooter(settings.receiptFooter || '');
      setDefaultCashier(settings.defaultCashier || '');
      setSoundEnabled(settings.soundEnabled !== false);
      setAutoPrint(Boolean(settings.autoPrint));
    }
  }, [settings]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    updateSettings({
      storeName: storeName.trim(),
      storeAddress: storeAddress.trim() || undefined,
      receiptFooter: receiptFooter.trim() || undefined,
      defaultCashier: defaultCashier.trim() || undefined,
      soundEnabled,
      autoPrint,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    updateSettings({ soundEnabled: nextVal });
    if (nextVal) {
      sounds.playBeep();
    }
  };

  const handleToggleAutoPrint = () => {
    const nextVal = !autoPrint;
    setAutoPrint(nextVal);
    updateSettings({ autoPrint: nextVal });
  };

  const handleTestSound = () => {
    sounds.playSuccess();
  };

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'id';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('settings.title', 'Pengaturan')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'settings.subtitle',
            'Kelola profil tokomu, tema visual, bahasa, dan opsi perangkat kasir.'
          )}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('settings.saved', 'Pengaturan Berhasil Disimpan!')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Profil Toko & Kasir */}
        <Card className="border-border/80 shadow-none md:col-span-2">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.profile.title', 'Profil Toko & Kasir')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.profile.desc',
                    'Informasi toko yang akan tercetak pada struk belanja pelanggan.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <form
              data-testid="profile-form"
              onSubmit={handleSaveProfile}
              className="space-y-4"
            >
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store Name */}
                <Field>
                  <FieldLabel htmlFor="store-name">
                    {t('settings.profile.storeName', 'Nama Toko')} *
                  </FieldLabel>
                  <Input
                    id="store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: Toko Kopi Senja"
                    disabled={isSettingsLoading}
                    required
                  />
                </Field>

                {/* Default Cashier */}
                <Field>
                  <FieldLabel htmlFor="default-cashier">
                    {t('settings.profile.defaultCashier', 'Nama Kasir Bawaan')}
                  </FieldLabel>
                  <Input
                    id="default-cashier"
                    value={defaultCashier}
                    onChange={(e) => setDefaultCashier(e.target.value)}
                    placeholder={t(
                      'settings.profile.defaultCashierPlaceholder',
                      'Contoh: Kasir 1'
                    )}
                    disabled={isSettingsLoading}
                  />
                </Field>

                {/* Store Address */}
                <Field>
                  <FieldLabel htmlFor="store-address">
                    {t('settings.profile.storeAddress', 'Alamat / Lokasi Toko')}
                  </FieldLabel>
                  <Input
                    id="store-address"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder={t(
                      'settings.profile.storeAddressPlaceholder',
                      'Contoh: Jl. Sudirman No. 45, Jakarta'
                    )}
                    disabled={isSettingsLoading}
                  />
                </Field>

                {/* Receipt Footer Message */}
                <Field>
                  <FieldLabel htmlFor="receipt-footer">
                    {t('settings.profile.receiptFooter', 'Pesan Kaki Struk')}
                  </FieldLabel>
                  <Input
                    id="receipt-footer"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    placeholder={t(
                      'settings.profile.receiptFooterPlaceholder',
                      'Contoh: Terima kasih atas kunjungan Anda!'
                    )}
                    disabled={isSettingsLoading}
                  />
                </Field>
              </FieldGroup>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSettingsLoading} className="cursor-pointer">
                  {t('settings.profile.saveBtn', 'Simpan Profil')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. Tema & Tampilan */}
        <Card className="border-border/80 shadow-none">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.appearance.title', 'Tema & Tampilan')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.appearance.desc',
                    'Sesuaikan kecerahan antarmuka agar nyaman saat digunakan bekerja.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">{t('settings.appearance.light', 'Terang')}</span>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">{t('settings.appearance.dark', 'Gelap')}</span>
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'system'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Laptop className="h-5 w-5" />
                <span className="text-xs">{t('settings.appearance.system', 'Sistem')}</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 3. Bahasa Aplikasi */}
        <Card className="border-border/80 shadow-none">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Languages className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.language.title', 'Bahasa Aplikasi')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.language.desc',
                    'Pilih bahasa tampilan untuk menu kasir, produk, dan laporan.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Indonesian */}
              <button
                type="button"
                onClick={() => i18n.changeLanguage('id')}
                className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  currentLang === 'id'
                    ? 'border-primary bg-primary/5 text-foreground font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-foreground">Bahasa Indonesia</p>
                  <p className="text-[11px] text-muted-foreground">ID (Bawaan)</p>
                </div>
                {currentLang === 'id' && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">
                    Aktif
                  </Badge>
                )}
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  currentLang === 'en'
                    ? 'border-primary bg-primary/5 text-foreground font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-foreground">English</p>
                  <p className="text-[11px] text-muted-foreground">EN (International)</p>
                </div>
                {currentLang === 'en' && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">
                    Active
                  </Badge>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Perangkat & Operasional Kasir */}
        <Card className="border-border/80 shadow-none md:col-span-2">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.device.title', 'Perangkat & Operasional Kasir')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.device.desc',
                    'Pengaturan suara transaksi dan status database lokal.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sound Effects Toggle */}
              <div className="p-4 rounded-lg border border-border/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs font-bold text-foreground">
                      {t('settings.device.soundEffects', 'Suara Efek Kasir')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      'settings.device.soundDesc',
                      'Suara audio saat scan barcode atau bayar berhasil.'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {soundEnabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleTestSound}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                      title="Uji Bunyi Suara"
                    >
                      <Volume1 className="h-3.5 w-3.5" />
                      <span>Uji</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant={soundEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleToggleSound}
                    className="h-7 text-xs px-3 cursor-pointer"
                  >
                    {soundEnabled ? 'Aktif' : 'Nonaktif'}
                  </Button>
                </div>
              </div>

              {/* Auto Print Receipt Toggle */}
              <div className="p-4 rounded-lg border border-border/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Printer className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {t('settings.device.autoPrint', 'Cetak Struk Otomatis')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      'settings.device.autoPrintDesc',
                      'Buka dialog cetak setelah bayar selesai.'
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={autoPrint ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleAutoPrint}
                  className="h-7 text-xs px-3 cursor-pointer"
                >
                  {autoPrint ? 'Aktif' : 'Nonaktif'}
                </Button>
              </div>

              {/* Local Database Storage Info */}
              <div className="p-4 rounded-lg border border-border/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {t('settings.device.storageStatus', 'Penyimpanan Lokal (IndexedDB)')}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      'settings.device.storageDesc',
                      '100% data tersimpan aman secara lokal di peramban.'
                    )}
                  </p>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs py-0.5 font-semibold">
                  Aman
                </Badge>
              </div>

              {/* Device ID */}
              <div className="p-4 rounded-lg border border-border/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">
                    {t('settings.device.deviceId', 'ID Terminal Toko')}
                  </span>
                  <p className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                    {settings?.id || 'Memuat...'}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs py-0.5 font-mono">
                  Offline-Ready
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
