import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Palette,
  Languages,
  Shield,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  CheckCircle2,
  Volume1,
  UserCheck,
  User,
  Users,
  KeyRound,
  Lock,
  Check,
  Database,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PinModal } from '@/components/pin-modal';
import { DataManagementSection } from '@/features/settings/components/data-management-section';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { sounds } from '@/utils/audio';
import type { UserRole } from '@/types/store.types';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useP2pSync();
  const { theme, setTheme } = useTheme();
  const { currentRole, setRole } = useAuthStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'appearance' | 'security' | 'data') || 'appearance';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // Form local state
  const [ownerPin, setOwnerPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

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
      setOwnerPin(settings.ownerPin || '');
      setSoundEnabled(settings.soundEnabled !== false);
      if (settings.activeRole) {
        setRole(settings.activeRole);
      }
    }
  }, [settings, setRole]);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ ownerPin: ownerPin.trim() || undefined });
    setIsSettingPin(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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

  const handleTestSound = () => {
    sounds.playSuccess();
  };

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'id';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('settings.title', 'Pengaturan Sistem')}
        description={t(
          'settings.subtitle',
          'Kelola tema visual antarmuka, efek audio kasir, otorisasi PIN keamanan, dan cadangan data aplikasi.'
        )}
      />

      {savedSuccess && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-2 text-primary text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('settings.saved', 'Pengaturan Berhasil Disimpan!')}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab}
        defaultValue="appearance"
        onValueChange={(val) => setActiveTab(val)}
        className="space-y-6"
      >
        <div className="border-b pb-1 flex items-center overflow-x-auto scrollbar-none">
          <TabsList className="h-10 p-1 bg-muted/60">
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
              <span>Cadangkan & Reset Data</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: TAMPILAN, BAHASA & SUARA */}
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
                      <p className="text-[11px] text-muted-foreground">Bawaan</p>
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
                      <p className="text-xs font-bold text-foreground">English</p>
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

            {/* Suara & Audio Feedback */}
            <Card className="border bg-card rounded-xl shadow-none md:col-span-2">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.sound.title', 'Efek Suara Kasir')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t(
                        'settings.sound.desc',
                        'Bunyi bip audio saat item ditambahkan dan bunyi sukses saat pembayaran selesai.'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer ${
                      soundEnabled
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="h-4 w-4" />
                        <span>{t('settings.sound.enabled', 'Suara Aktif')}</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-4 w-4" />
                        <span>{t('settings.sound.disabled', 'Suara Senyap')}</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs text-muted-foreground">
                    {soundEnabled
                      ? t(
                          'settings.sound.enabledDesc',
                          'Umpan balik audio aktif untuk setiap interaksi kasir.'
                        )
                      : t('settings.sound.disabledDesc', 'Aplikasi dalam mode senyap / hening.')}
                  </span>
                </div>

                {soundEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestSound}
                    className="gap-2 text-xs font-bold cursor-pointer border-border hover:bg-muted/40"
                  >
                    <Volume1 className="h-4 w-4 text-primary" />
                    <span>{t('settings.sound.test', 'Tes Bunyi Sukses')}</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: KEAMANAN, PIN & OTORISASI PERAN */}
        <TabsContent value="security" className="space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Otorisasi PIN Pemilik */}
            <Card className="border bg-card rounded-xl shadow-none">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.security.pinTitle', 'PIN Pemilik Toko')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t(
                        'settings.security.pinDesc',
                        'Lindungi tindakan sensitif (hapus produk, void transaksi, promosi jabatan).'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        settings?.ownerPin
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {settings?.ownerPin ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {settings?.ownerPin
                          ? t('settings.security.pinActive', 'PIN Aktif & Terlindungi')
                          : t('settings.security.pinNotSet', 'PIN Belum Diatur')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {settings?.ownerPin
                          ? t(
                              'settings.security.pinActiveDesc',
                              'Diperlukan saat staf melakukan aksi manajerial.'
                            )
                          : t(
                              'settings.security.pinNotSetDesc',
                              'Semua peran dapat mengubah data tanpa sandi.'
                            )}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={isSettingPin ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setIsSettingPin(!isSettingPin)}
                    className="text-xs font-bold cursor-pointer"
                  >
                    {settings?.ownerPin
                      ? t('settings.security.changePin', 'Ubah PIN')
                      : t('settings.security.setPin', 'Pasang PIN')}
                  </Button>
                </div>

                {isSettingPin && (
                  <form
                    onSubmit={handleSavePin}
                    className="p-4 bg-muted/20 border border-dashed rounded-xl space-y-3 animate-in fade-in-50"
                  >
                    <Field>
                      <FieldLabel htmlFor="settings-owner-pin" className="text-xs font-bold">
                        {t('settings.security.enterPin', 'Masukkan 4-6 Digit Angka PIN')}
                      </FieldLabel>
                      <Input
                        id="settings-owner-pin"
                        type="password"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Contoh: 1234"
                        value={ownerPin}
                        onChange={(e) => setOwnerPin(e.target.value.replace(/[^0-9]/g, ''))}
                        className="h-10 text-center text-lg font-mono tracking-widest bg-card"
                        autoFocus
                      />
                      <FieldDescription>
                        {t(
                          'settings.security.pinTip',
                          'Gunakan angka yang mudah Anda ingat tetapi sulit ditebak staf kasir.'
                        )}
                      </FieldDescription>
                    </Field>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={ownerPin.length < 4}
                        className="flex-1 font-bold text-xs cursor-pointer"
                      >
                        {t('settings.security.savePin', 'Simpan PIN')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSettingPin(false)}
                        className="text-xs cursor-pointer"
                      >
                        {t('common.actions.cancel', 'Batal')}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Switch Peran Pengguna Aktif di Perangkat Ini */}
            <Card className="border bg-card rounded-xl shadow-none">
              <CardHeader className="p-5 pb-3 border-b">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {t('settings.security.roleTitle', 'Peran Pengguna Saat Ini')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t(
                        'settings.security.roleDesc',
                        'Tentukan level hak akses staf pada terminal kasir ini.'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                {/* Cashier Role */}
                <button
                  type="button"
                  onClick={() => handleSwitchRole('CASHIER')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    currentRole === 'CASHIER'
                      ? 'border-primary bg-primary/5 text-foreground font-bold shadow-xs'
                      : 'border-border hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t('settings.security.roleCashier', 'Kasir / Staf Penjualan')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t(
                          'settings.security.roleCashierDesc',
                          'Hanya dapat melakukan transaksi penjualan & cetak nota.'
                        )}
                      </p>
                    </div>
                  </div>
                  {currentRole === 'CASHIER' && (
                    <Badge variant="default" className="text-[10px] px-2 py-0.5">
                      Aktif
                    </Badge>
                  )}
                </button>

                {/* Manager Role */}
                <button
                  type="button"
                  onClick={() => handleSwitchRole('MANAGER')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    currentRole === 'MANAGER'
                      ? 'border-primary bg-primary/5 text-foreground font-bold shadow-xs'
                      : 'border-border hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t('settings.security.roleManager', 'Manajer Toko')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t(
                          'settings.security.roleManagerDesc',
                          'Dapat mengelola katalog produk & melihat laporan omzet.'
                        )}
                      </p>
                    </div>
                  </div>
                  {currentRole === 'MANAGER' && (
                    <Badge variant="default" className="text-[10px] px-2 py-0.5">
                      Aktif
                    </Badge>
                  )}
                </button>

                {/* Owner Role */}
                <button
                  type="button"
                  onClick={() => handleSwitchRole('OWNER')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    currentRole === 'OWNER'
                      ? 'border-primary bg-primary/5 text-foreground font-bold shadow-xs'
                      : 'border-border hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t('settings.security.roleOwner', 'Pemilik Usaha (Owner)')}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t(
                          'settings.security.roleOwnerDesc',
                          'Akses penuh ke seluruh pengaturan, reset data, dan laporan laba rugi.'
                        )}
                      </p>
                    </div>
                  </div>
                  {currentRole === 'OWNER' && (
                    <Badge variant="default" className="text-[10px] px-2 py-0.5">
                      Aktif
                    </Badge>
                  )}
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: MANAJEMEN & RESET DATA */}
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
    </div>
  );
};

export default SettingsPage;
