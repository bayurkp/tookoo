import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, Sparkles, Smartphone, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { WelcomeOnboardingDialog } from '@/features/onboarding/components/welcome-onboarding-dialog';
import { AppModeSwitcher } from '@/components/app-mode-switcher';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/utils/currency-config';
import type { CurrencyCode } from '@/types/currency.types';

export const StoreProfilePage: React.FC = () => {
  const { settings, isSettingsLoading, updateSettings } = useP2pSync();

  const [storeName, setStoreName] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [storeAddress, setStoreAddress] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [defaultCashier, setDefaultCashier] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setCurrency(settings.currency || DEFAULT_CURRENCY);
      setStoreAddress(settings.storeAddress || '');
      setDeviceName(settings.deviceName || '');
      setDefaultCashier(settings.defaultCashier || '');
    }
  }, [settings]);

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    await updateSettings({
      storeName: storeName.trim(),
      currency,
      storeAddress: storeAddress.trim(),
      deviceName: deviceName.trim(),
      defaultCashier: defaultCashier.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Profil Bisnis & Toko
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identitas resmi toko, mata uang transaksi, alamat usaha, dan profil terminal kasir.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsSetupWizardOpen(true)}
          className="gap-2 text-xs font-semibold shrink-0"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Buka Panduan Setup Awal</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-2 text-primary text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4" />
          <span>Profil Toko & Terminal Berhasil Disimpan!</span>
        </div>
      )}

      {/* Mode Operasional Aplikasi (Simple vs Advanced) */}
      <Card className="border bg-card rounded-xl shadow-none">
        <CardHeader className="p-5 pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-bold text-foreground">
                Mode Operasional Toko
              </CardTitle>
              <CardDescription className="text-xs">
                Pilih tampilan sederhana untuk kasir cepat, atau mode lengkap untuk fitur
                multi-varian & denah meja.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <AppModeSwitcher variant="card" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Identitas Bisnis */}
        <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Store className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">Identitas Usaha</CardTitle>
                <CardDescription className="text-xs">
                  Nama usaha dan mata uang utama penjualan kasir.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 flex-1">
            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Nama Toko / Usaha *</FieldLabel>
                  <Input
                    placeholder="misal: Tookoo Coffee & Eatery"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    disabled={isSettingsLoading}
                    className="h-9 text-xs"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Mata Uang Utama</FieldLabel>
                  <Select
                    value={currency}
                    onValueChange={(val) => setCurrency(val as CurrencyCode)}
                    disabled={isSettingsLoading}
                  >
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Pilih Mata Uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SUPPORTED_CURRENCIES.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name} ({curr.symbol})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Alamat Toko (Header Struk)</FieldLabel>
                  <Input
                    placeholder="misal: Jl. Boulevard Raya Blok A No. 12"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    disabled={isSettingsLoading}
                    className="h-9 text-xs"
                  />
                </Field>
              </FieldGroup>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSettingsLoading}
                  className="w-full font-bold text-xs gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Identitas Usaha</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Profil Terminal Kasir */}
        <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">
                  Profil Terminal Perangkat
                </CardTitle>
                <CardDescription className="text-xs">
                  Pengenal perangkat kasir ini di jaringan lokal P2P.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 flex-1">
            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Nama Terminal Ini</FieldLabel>
                  <Input
                    placeholder="misal: Kasir Utama / Bar Depan"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    disabled={isSettingsLoading}
                    className="h-9 text-xs"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Nama Kasir Bawaan</FieldLabel>
                  <Input
                    placeholder="misal: Hendra"
                    value={defaultCashier}
                    onChange={(e) => setDefaultCashier(e.target.value)}
                    disabled={isSettingsLoading}
                    className="h-9 text-xs"
                  />
                </Field>
              </FieldGroup>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={isSettingsLoading}
                  className="w-full font-bold text-xs gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Profil Terminal</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Setup Wizard Dialog */}
      <WelcomeOnboardingDialog forceOpen={isSetupWizardOpen} onOpenChange={setIsSetupWizardOpen} />
    </div>
  );
};

export default StoreProfilePage;
