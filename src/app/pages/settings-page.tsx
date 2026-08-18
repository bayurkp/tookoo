import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Users,
  KeyRound,
  Lock,
  Check,
  Database,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { PinModal } from '@/components/pin-modal';
import { ReceiptSettingsSection } from '@/features/settings/components/receipt-settings-section';
import { DataManagementSection } from '@/features/settings/components/data-management-section';
import { WelcomeOnboardingDialog } from '@/features/onboarding/components/welcome-onboarding-dialog';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { AppModeSwitcher } from '@/components/app-mode-switcher';
import { sounds } from '@/utils/audio';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/utils/currency-config';
import type { CurrencyCode } from '@/types/currency.types';
import type { UserRole, ReceiptSettings } from '@/types/store.types';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, isSettingsLoading, updateSettings } = useP2pSync();
  const { theme, setTheme } = useTheme();
  const { currentRole, setRole } = useAuthStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    (searchParams.get('tab') as 'general' | 'receipt' | 'appearance' | 'security' | 'data') ||
    'general';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // Form local state
  const [storeName, setStoreName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [storeAddress, setStoreAddress] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [defaultCashier, setDefaultCashier] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  const isRolePromotion = (targetRole: UserRole) => {
    const roleRank: Record<UserRole, number> = {
      CASHIER: 1,
      MANAGER: 2,
      OWNER: 3,
    };
    return roleRank[targetRole] > roleRank[currentRole];
  };

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setCurrency(settings.currency || DEFAULT_CURRENCY);
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

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    await updateSettings({
      storeName: storeName.trim(),
      currency,
      storeAddress: storeAddress.trim() || undefined,
      receiptFooter: receiptFooter.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveDeviceProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      deviceName: deviceName.trim() || undefined,
      defaultCashier: defaultCashier.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ ownerPin: ownerPin.trim() || undefined });
    setIsSettingPin(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveReceiptSettings = async (receiptSettings: ReceiptSettings) => {
    await updateSettings({ receiptSettings });
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === currentRole) return;

    if (isRolePromotion(newRole) && settings?.ownerPin) {
      setPendingRole(newRole);
      setPinModalOpen(true);
    } else {
      setRole(newRole);
      updateSettings({ activeRole: newRole });
    }
  };

  const handlePinSuccess = () => {
    if (pendingRole) {
      setRole(pendingRole);
      updateSettings({ activeRole: pendingRole });
      setPendingRole(null);
    }
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('settings.title', 'Pengaturan Toko')}
        </h2>
        <p className="text-muted-foreground text-xs mt-0.5">
          {t(
            'settings.subtitle',
            'Kelola profil toko, format desain nota struk, tema, bahasa, suara, dan otorisasi keamanan.'
          )}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-2 text-primary text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('settings.saved', 'Pengaturan Berhasil Disimpan!')}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab}
        defaultValue="general"
        onValueChange={(val) => setActiveTab(val)}
        className="space-y-6"
      >
        <div className="border-b pb-1 flex items-center overflow-x-auto scrollbar-none">
          <TabsList className="h-10 p-1 bg-muted/60">
            <TabsTrigger value="general" className="gap-2 text-xs font-bold px-3.5 py-1.5">
              <Store className="h-3.5 w-3.5" />
              <span>Profil & Sistem</span>
            </TabsTrigger>
            <TabsTrigger value="receipt" className="gap-2 text-xs font-bold px-3.5 py-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>Format Nota & Struk</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 text-xs font-bold px-3.5 py-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span>Tampilan & Suara</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs font-bold px-3.5 py-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>Keamanan & PIN</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 text-xs font-bold px-3.5 py-1.5">
              <Database className="h-3.5 w-3.5" />
              <span>Manajemen & Reset Data</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: PROFIL TOKO & PERANGKAT */}
        <TabsContent value="general" className="space-y-6 m-0">
          {/* Mode Operasional Aplikasi (Simple vs Advanced) */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-5 pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Mode Operasional Aplikasi (Application Mode)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pilih antara Mode Sederhana (Lite & Cepat) atau Mode Lanjutan (Fitur Lengkap
                    Pro).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <AppModeSwitcher variant="inline" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Profil Toko */}
            <Card className="border bg-card rounded-xl shadow-none md:col-span-2">
              <CardHeader className="p-5 pb-3 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.storeProfile.title', 'Profil & Identitas Toko')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t(
                        'settings.storeProfile.desc',
                        'Nama, alamat, dan mata uang transaksi kasir toko.'
                      )}
                    </CardDescription>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSetupWizardOpen(true)}
                  className="h-8 text-xs font-bold gap-1.5 cursor-pointer shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ulangi Setup Awal (Wizard)</span>
                </Button>
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
                      <FieldLabel htmlFor="store-name" className="text-xs font-bold">
                        {t('settings.storeProfile.storeName', 'Nama Toko')} *
                      </FieldLabel>
                      <Input
                        id="store-name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Contoh: Toko Kopi Senja"
                        disabled={isSettingsLoading}
                        required
                        className="h-9 text-xs"
                      />
                    </Field>

                    {/* Store Address */}
                    <Field>
                      <FieldLabel htmlFor="store-address" className="text-xs font-bold">
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
                        className="h-9 text-xs"
                      />
                    </Field>

                    {/* Receipt Footer Message */}
                    <Field>
                      <FieldLabel htmlFor="receipt-footer" className="text-xs font-bold">
                        {t('settings.storeProfile.receiptFooter', 'Slogan / Tagline Toko')}
                      </FieldLabel>
                      <Input
                        id="receipt-footer"
                        value={receiptFooter}
                        onChange={(e) => setReceiptFooter(e.target.value)}
                        placeholder="Contoh: Fresh Coffee & Daily Roastery"
                        disabled={isSettingsLoading}
                        className="h-9 text-xs"
                      />
                    </Field>

                    {/* Store Currency */}
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="store-currency" className="text-xs font-bold">
                        {t('settings.storeProfile.currency', 'Mata Uang & Format Angka Toko')}
                      </FieldLabel>
                      <Select
                        value={currency}
                        onValueChange={(val) => setCurrency(val as CurrencyCode)}
                        disabled={isSettingsLoading}
                      >
                        <SelectTrigger
                          id="store-currency"
                          className="w-full font-semibold h-9 text-xs"
                        >
                          <SelectValue placeholder="Pilih Mata Uang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.name} ({c.code}) — {c.symbol}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Format pemisah ribuan (&ldquo;
                        {SUPPORTED_CURRENCIES[currency].thousandSeparator}&rdquo;) dan desimal (
                        {SUPPORTED_CURRENCIES[currency].decimalDigits} digit) akan otomatis
                        diterapkan di kasir, produk, dan laporan keuangan.
                      </p>
                    </Field>
                  </FieldGroup>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isSettingsLoading}
                      className="cursor-pointer font-bold text-xs"
                    >
                      {t('settings.storeProfile.saveBtn', 'Simpan Profil Toko')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 2. Profil Perangkat (Device Profile) */}
            <Card className="border bg-card rounded-xl shadow-none md:col-span-2">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.deviceProfile.title', 'Profil Perangkat & Terminal Kasir')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t(
                        'settings.deviceProfile.desc',
                        'Identitas terminal kasir ini dalam jaringan P2P offline toko.'
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
                      <FieldLabel htmlFor="device-name" className="text-xs font-bold">
                        {t('settings.deviceProfile.deviceName', 'Nama Terminal / HP Ini')}
                      </FieldLabel>
                      <Input
                        id="device-name"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="Contoh: Kasir Utama (Tablet) / HP Kasir 1"
                        disabled={isSettingsLoading}
                        className="h-9 text-xs"
                      />
                    </Field>

                    {/* Default Cashier */}
                    <Field>
                      <FieldLabel htmlFor="default-cashier" className="text-xs font-bold">
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
                        className="h-9 text-xs"
                      />
                    </Field>
                  </FieldGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Device ID Info */}
                    <div className="p-3.5 rounded-lg border flex items-center justify-between gap-3">
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
                    <div className="p-3.5 rounded-lg border flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground">
                          Penyimpanan Offline
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          IndexedDB Browser Terenkripsi
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/30 bg-primary/10 text-xs py-0.5 font-semibold"
                      >
                        Aman & Lokal
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isSettingsLoading}
                      className="cursor-pointer font-bold text-xs"
                    >
                      {t('settings.deviceProfile.saveBtn', 'Simpan Profil Perangkat')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: FORMAT NOTA & STRUK KASIR (DEDICATED SECTION) */}
        <TabsContent value="receipt" className="space-y-6 m-0">
          <ReceiptSettingsSection settings={settings || null} onSave={handleSaveReceiptSettings} />
        </TabsContent>

        {/* TAB 3: TAMPILAN, BAHASA & SUARA */}
        <TabsContent value="appearance" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tema & Tampilan */}
            <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between h-full">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Palette className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.appearance.title', 'Tema & Tampilan')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t(
                        'settings.appearance.desc',
                        'Sesuaikan kecerahan antarmuka kasir agar nyaman saat bekerja.'
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
                    <span className="text-xs leading-tight">
                      {t('settings.appearance.light', 'Mode Terang')}
                    </span>
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
                    <span className="text-xs leading-tight">
                      {t('settings.appearance.dark', 'Mode Gelap')}
                    </span>
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
                    <span className="text-xs leading-tight">
                      {t('settings.appearance.system', 'Otomatis')}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Bahasa Aplikasi */}
            <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between h-full">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Languages className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.language.title', 'Bahasa Antarmuka')}
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
                    <div>
                      <p className="text-xs font-bold text-foreground">Bahasa Indonesia</p>
                      <p className="text-[11px] text-muted-foreground">Bawaan (Default)</p>
                    </div>
                    {currentLang === 'id' && (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
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
                    <div>
                      <p className="text-xs font-bold text-foreground">English (US)</p>
                      <p className="text-[11px] text-muted-foreground">International</p>
                    </div>
                    {currentLang === 'en' && (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Efek Suara & Cetak Otomatis */}
            <Card className="border bg-card rounded-xl shadow-none md:col-span-2">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.sound.title', 'Suara Transaksi & Cetak')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t(
                        'settings.sound.desc',
                        'Efek audio transaksi sukses dan perilaku cetak struk kasir.'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sound Toggle */}
                  <div className="p-4 rounded-lg border flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {soundEnabled ? (
                          <Volume2 className="h-4 w-4 text-primary" />
                        ) : (
                          <VolumeX className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-bold text-foreground">
                          {t('settings.sound.toggle', 'Efek Suara Kasir')}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {t('settings.sound.toggleDesc', 'Bunyi saat klik menu & sukses bayar.')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {soundEnabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleTestSound}
                          className="h-7 text-xs px-2 gap-1 cursor-pointer"
                          title="Coba Suara"
                        >
                          <Volume1 className="h-3.5 w-3.5" />
                          <span>Tes</span>
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
                  <div className="p-4 rounded-lg border flex items-center justify-between gap-3">
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: KEAMANAN & PIN OTORISASI */}
        <TabsContent value="security" className="space-y-6 m-0">
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-5 pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {t('settings.security.title', 'Keamanan & Hak Akses Terminal')}
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
                <div className="p-4 rounded-lg border space-y-3">
                  <div>
                    <span className="text-xs font-bold text-foreground">Peran Terminal Ini</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSwitchRole('OWNER')}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer relative ${
                        currentRole === 'OWNER'
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-border hover:bg-muted/40 text-muted-foreground'
                      }`}
                      title={
                        isRolePromotion('OWNER')
                          ? 'Perlu PIN Pemilik untuk beralih ke peran Pemilik'
                          : 'Pemilik Toko (Akses Penuh)'
                      }
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <UserCheck className="h-4 w-4" />
                        {isRolePromotion('OWNER') && (
                          <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs">Pemilik</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchRole('MANAGER')}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer relative ${
                        currentRole === 'MANAGER'
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-border hover:bg-muted/40 text-muted-foreground'
                      }`}
                      title={
                        isRolePromotion('MANAGER')
                          ? 'Perlu PIN Pemilik untuk beralih ke peran Manajer'
                          : 'Manajer (Kelola Produk & Laporan)'
                      }
                    >
                      <div className="flex items-center justify-center gap-0.5">
                        <Users className="h-4 w-4" />
                        {isRolePromotion('MANAGER') && (
                          <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs">Manajer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchRole('CASHIER')}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                        currentRole === 'CASHIER'
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-border hover:bg-muted/40 text-muted-foreground'
                      }`}
                      title="Kasir (Khusus Jualan)"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-xs">Kasir</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {currentRole === 'OWNER' &&
                      'Pemilik: Akses penuh dan berwenang menentukan peran manajer maupun kasir.'}
                    {currentRole === 'MANAGER' &&
                      'Manajer: Akses produk & laporan. Dapat beralih ke Kasir, namun perlu PIN untuk menjadi Pemilik.'}
                    {currentRole === 'CASHIER' &&
                      'Kasir: Khusus transaksi penjualan. Perlu PIN Pemilik untuk beralih peran.'}
                  </p>
                </div>

                {/* Owner PIN Management */}
                <div className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        PIN Keamanan Pemilik
                      </span>
                    </div>
                    <Badge
                      variant={settings?.ownerPin ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
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
                          className="h-7 text-xs font-bold"
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
                        className="h-7 text-xs w-full cursor-pointer font-semibold"
                      >
                        {settings?.ownerPin ? 'Ubah PIN Pemilik' : 'Pasang PIN Pemilik'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: MANAJEMEN & RESET DATA */}
        <TabsContent value="data" className="space-y-6 m-0">
          <DataManagementSection />
        </TabsContent>
      </Tabs>

      {/* PIN Verification Modal for Role Elevation */}
      <PinModal
        open={pinModalOpen}
        onOpenChange={setPinModalOpen}
        correctPin={settings?.ownerPin}
        title="Otorisasi PIN Pemilik"
        description={`Masukkan PIN Pemilik untuk mengubah peran terminal menjadi ${
          pendingRole === 'OWNER' ? 'Pemilik' : 'Manajer'
        }.`}
        onSuccess={handlePinSuccess}
      />

      {/* Re-run Onboarding Setup Wizard */}
      <WelcomeOnboardingDialog
        forceOpen={isSetupWizardOpen}
        onOpenChange={setIsSetupWizardOpen}
      />
    </div>
  );
};

export default SettingsPage;
