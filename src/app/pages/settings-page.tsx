import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Palette,
  Languages,
  Smartphone,
  Shield,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Printer,
  CheckCircle2,
  Volume1,
  UserCheck,
  User,
  KeyRound,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { sounds } from '@/utils/audio';
import type { UserRole } from '@/types/store.types';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, isSettingsLoading, updateSettings } = useP2pSync();
  const { theme, setTheme } = useTheme();
  const { currentRole, setRole } = useAuthStore();

  // Form local state
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [defaultCashier, setDefaultCashier] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setStoreAddress(settings.storeAddress || '');
      setReceiptFooter(settings.receiptFooter || '');
      setDeviceName(settings.deviceName || '');
      setDefaultCashier(settings.defaultCashier || '');
      setOwnerPin(settings.ownerPin || '');
      setSoundEnabled(settings.soundEnabled !== false);
      setAutoPrint(Boolean(settings.autoPrint));
      if (settings.activeRole) {
        setRole(settings.activeRole);
      }
    }
  }, [settings, setRole]);

  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    updateSettings({
      storeName: storeName.trim(),
      storeAddress: storeAddress.trim() || undefined,
      receiptFooter: receiptFooter.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveDeviceProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      deviceName: deviceName.trim() || undefined,
      defaultCashier: defaultCashier.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ ownerPin: ownerPin.trim() || undefined });
    setIsSettingPin(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setRole(newRole);
    updateSettings({ activeRole: newRole });
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
        <h2 className="text-2xl font-bold tracking-tight">{t('settings.title', 'Pengaturan')}</h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'settings.subtitle',
            'Kelola profil toko, profil perangkat, tema, bahasa, suara, dan keamanan.'
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
        {/* 1. Profil Toko (Store Profile) */}
        <Card className="border-border/80 shadow-none md:col-span-2">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.storeProfile.title', 'Profil Toko')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.storeProfile.desc',
                    'Nama, alamat, dan pesan kaki yang akan tercetak di struk belanja pelanggan.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <form
              data-testid="profile-form"
              onSubmit={handleSaveStoreProfile}
              className="space-y-4"
            >
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store Name */}
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="store-name">
                    {t('settings.storeProfile.storeName', 'Nama Toko')} *
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

                {/* Store Address */}
                <Field>
                  <FieldLabel htmlFor="store-address">
                    {t('settings.storeProfile.storeAddress', 'Alamat / Lokasi Toko')}
                  </FieldLabel>
                  <Input
                    id="store-address"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder={t(
                      'settings.storeProfile.storeAddressPlaceholder',
                      'Contoh: Jl. Sudirman No. 45, Jakarta'
                    )}
                    disabled={isSettingsLoading}
                  />
                </Field>

                {/* Receipt Footer Message */}
                <Field>
                  <FieldLabel htmlFor="receipt-footer">
                    {t('settings.storeProfile.receiptFooter', 'Pesan Kaki Struk')}
                  </FieldLabel>
                  <Input
                    id="receipt-footer"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    placeholder={t(
                      'settings.storeProfile.receiptFooterPlaceholder',
                      'Contoh: Terima kasih atas kunjungan Anda!'
                    )}
                    disabled={isSettingsLoading}
                  />
                </Field>
              </FieldGroup>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSettingsLoading} className="cursor-pointer">
                  {t('settings.storeProfile.saveBtn', 'Simpan Profil Toko')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. Profil Perangkat (Device Profile) */}
        <Card className="border-border/80 shadow-none md:col-span-2">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.deviceProfile.title', 'Profil Perangkat & Terminal')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.deviceProfile.desc',
                    'Identitas terminal kasir ini dalam jaringan lokal toko.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={handleSaveDeviceProfile} className="space-y-4">
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Device / Terminal Name */}
                <Field>
                  <FieldLabel htmlFor="device-name">
                    {t('settings.deviceProfile.deviceName', 'Nama Terminal / HP Ini')}
                  </FieldLabel>
                  <Input
                    id="device-name"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="Contoh: Kasir Utama (Tablet) / HP Kasir 1"
                    disabled={isSettingsLoading}
                  />
                </Field>

                {/* Default Cashier */}
                <Field>
                  <FieldLabel htmlFor="default-cashier">
                    {t('settings.deviceProfile.defaultCashier', 'Nama Kasir Bawaan')}
                  </FieldLabel>
                  <Input
                    id="default-cashier"
                    value={defaultCashier}
                    onChange={(e) => setDefaultCashier(e.target.value)}
                    placeholder={t(
                      'settings.deviceProfile.defaultCashierPlaceholder',
                      'Contoh: Kasir 1'
                    )}
                    disabled={isSettingsLoading}
                  />
                </Field>
              </FieldGroup>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Device ID Info */}
                <div className="p-3.5 rounded-lg border border-border/80 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">
                      {t('settings.device.deviceId', 'ID Terminal Toko')}
                    </span>
                    <p className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                      {settings?.id || 'Memuat...'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs py-0.5 font-mono">
                    {deviceName || 'Terminal Kasir'}
                  </Badge>
                </div>

                {/* Storage Status */}
                <div className="p-3.5 rounded-lg border border-border/80 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground">Penyimpanan Offline</span>
                    <p className="text-[11px] text-muted-foreground">
                      IndexedDB Browser Terenkripsi
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs py-0.5 font-semibold"
                  >
                    Aman & Lokal
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSettingsLoading} className="cursor-pointer">
                  {t('settings.deviceProfile.saveBtn', 'Simpan Profil Perangkat')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 3. Tema & Tampilan */}
        <Card className="border-border/80 shadow-none flex flex-col justify-between h-full">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Palette className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-bold">
                  {t('settings.appearance.title', 'Tema & Tampilan')}
                </CardTitle>
                <CardDescription className="text-xs min-h-[34px] flex items-center">
                  {t(
                    'settings.appearance.desc',
                    'Sesuaikan kecerahan antarmuka agar nyaman saat digunakan bekerja.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-2.5">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`h-20 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs leading-tight">{t('settings.appearance.light', 'Mode Terang')}</span>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`h-20 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs leading-tight">{t('settings.appearance.dark', 'Mode Gelap')}</span>
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`h-20 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  theme === 'system'
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Laptop className="h-5 w-5" />
                <span className="text-xs leading-tight">{t('settings.appearance.system', 'Otomatis Sistem')}</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Bahasa Aplikasi */}
        <Card className="border-border/80 shadow-none flex flex-col justify-between h-full">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Languages className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-bold">
                  {t('settings.language.title', 'Bahasa Aplikasi')}
                </CardTitle>
                <CardDescription className="text-xs min-h-[34px] flex items-center">
                  {t(
                    'settings.language.desc',
                    'Pilih bahasa tampilan untuk menu kasir, produk, dan laporan.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-3">
              {/* Indonesian */}
              <button
                type="button"
                onClick={() => i18n.changeLanguage('id')}
                className={`h-20 px-3.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  currentLang === 'id'
                    ? 'border-primary bg-primary/5 text-foreground font-bold shadow-xs'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="min-w-0 flex-1 pr-1">
                  <p className="text-xs font-bold text-foreground truncate">Bahasa Indonesia</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">ID (Bawaan)</p>
                </div>
                {currentLang === 'id' && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
                    Aktif
                  </Badge>
                )}
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`h-20 px-3.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  currentLang === 'en'
                    ? 'border-primary bg-primary/5 text-foreground font-bold shadow-xs'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="min-w-0 flex-1 pr-1">
                  <p className="text-xs font-bold text-foreground truncate">English</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">EN (International)</p>
                </div>
                {currentLang === 'en' && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
                    Active
                  </Badge>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 5. Suara & Operasional Percetakan */}
        <Card className="border-border/80 shadow-none md:col-span-2">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Volume2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.sound.title', 'Suara & Operasional Kasir')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.sound.desc',
                    'Pengaturan suara transaksi dan status otomatisasi pencetakan struk.'
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
                    {t('settings.device.autoPrintDesc', 'Buka dialog cetak setelah bayar selesai.')}
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
            </div>
          </CardContent>
        </Card>

        {/* 6. Keamanan & Peran Terminal (RBAC & PIN) */}
        <Card className="border-border/80 shadow-none md:col-span-2">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {t('settings.security.title', 'Keamanan & Hak Akses')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.security.desc',
                    'Atur PIN Pemilik Toko untuk mengunci menu laporan omzet dan pengaturan sensitif.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Selector Card */}
              <div className="p-4 rounded-lg border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Peran Terminal Ini</span>
                  <Badge
                    variant={currentRole === 'OWNER' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {currentRole === 'OWNER' ? 'Pemilik (Owner)' : 'Kasir (Staff)'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchRole('OWNER')}
                    className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      currentRole === 'OWNER'
                        ? 'border-primary bg-primary/5 text-primary font-bold'
                        : 'border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span className="text-xs">Pemilik Toko</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchRole('CASHIER')}
                    className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      currentRole === 'CASHIER'
                        ? 'border-primary bg-primary/5 text-primary font-bold'
                        : 'border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="text-xs">Kasir / Staf</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Mode Kasir membatasi akses ke menu laporan pendapatan dan kunci sinkronisasi.
                </p>
              </div>

              {/* Owner PIN Management */}
              <div className="p-4 rounded-lg border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">PIN Keamanan Pemilik</span>
                  </div>
                  <Badge variant={settings?.ownerPin ? 'outline' : 'secondary'} className="text-xs">
                    {settings?.ownerPin ? 'PIN Aktif' : 'Belum Ada PIN'}
                  </Badge>
                </div>

                {isSettingPin ? (
                  <form onSubmit={handleSavePin} className="space-y-2">
                    <Input
                      type="password"
                      maxLength={6}
                      value={ownerPin}
                      onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Masukkan 4-6 digit PIN"
                      className="text-center font-bold tracking-widest h-9 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSettingPin(false)}
                        className="h-7 text-xs"
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={ownerPin.length < 4}
                      >
                        Simpan PIN
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      {settings?.ownerPin
                        ? 'PIN digunakan untuk membuka otorisasi saat terminal dalam mode kasir.'
                        : 'Belum ada PIN master. Pasang PIN untuk melindungi menu toko Anda.'}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSettingPin(true)}
                      className="h-7 text-xs w-full cursor-pointer"
                    >
                      {settings?.ownerPin ? 'Ubah PIN Pemilik' : 'Pasang PIN Pemilik'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
