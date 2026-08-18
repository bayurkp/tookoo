import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, Sparkles, Smartphone, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useP2pSync } from '@/features/sync/hooks/use-p2p-sync';
import { WelcomeOnboardingDialog } from '@/features/onboarding/components/welcome-onboarding-dialog';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/utils/currency-config';
import type { CurrencyCode } from '@/types/currency.types';

export const StoreProfilePage: React.FC = () => {
  const { t } = useTranslation();
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
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t('settings.storeProfile.title', 'Profil Toko')}
        description={t(
          'settings.storeProfile.desc',
          'Informasi toko yang akan tercetak pada struk belanja pelanggan.'
        )}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSetupWizardOpen(true)}
            className="gap-2 text-xs font-semibold shrink-0"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{t('onboarding.setupGuide', 'Buka Panduan Setup Awal')}</span>
          </Button>
        }
      />

      {savedSuccess && (
        <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-2 text-primary text-xs font-semibold animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('common.states.saved', 'Data Berhasil Disimpan')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Business Identity */}
        <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Store className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">
                  {t('settings.storeProfile.title', 'Identitas Usaha')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t(
                    'settings.storeProfile.desc',
                    'Nama usaha dan mata uang utama penjualan kasir.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 flex-1">
            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">
                    {t('settings.storeProfile.storeName', 'Nama Toko')} *
                  </FieldLabel>
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
                  <FieldLabel className="text-xs font-bold">
                    {t('settings.currency.title', 'Mata Uang Utama')}
                  </FieldLabel>
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
                        {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name} ({curr.symbol})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">
                    {t('settings.storeProfile.storeAddress', 'Alamat Toko')}
                  </FieldLabel>
                  <Input
                    placeholder={t(
                      'settings.storeProfile.storeAddressPlaceholder',
                      'Contoh: Jl. Sudirman No. 45, Jakarta'
                    )}
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
                  <span>{t('settings.storeProfile.saveBtn', 'Simpan Profil Toko')}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Terminal & Device Profile */}
        <Card className="border bg-card rounded-xl shadow-none flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">
                  {t('settings.deviceProfile.title', 'Profil Terminal')}
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

          <CardContent className="p-5 flex-1">
            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <FieldGroup className="space-y-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">
                    {t('settings.deviceProfile.deviceName', 'Nama Terminal Ini')}
                  </FieldLabel>
                  <Input
                    placeholder="misal: Kasir Utama / Bar Depan"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    disabled={isSettingsLoading}
                    className="h-9 text-xs"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">
                    {t('settings.deviceProfile.defaultCashier', 'Nama Kasir Bawaan')}
                  </FieldLabel>
                  <Input
                    placeholder={t(
                      'settings.deviceProfile.defaultCashierPlaceholder',
                      'Contoh: Kasir 1'
                    )}
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
                  <span>{t('settings.deviceProfile.saveBtn', 'Simpan Profil Perangkat')}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Setup Wizard Dialog */}
      <WelcomeOnboardingDialog forceOpen={isSetupWizardOpen} onOpenChange={setIsSetupWizardOpen} />
    </div>
  );
};

export default StoreProfilePage;
