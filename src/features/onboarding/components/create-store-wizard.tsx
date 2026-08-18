import React, { useState } from 'react';
import {
  Store,
  Monitor,
  User,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap,
  Coffee,
  UtensilsCrossed,
  ShoppingBag,
  Scissors,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BUSINESS_TEMPLATES,
  type BusinessTemplate,
  type TemplateIconName,
} from '../data/starter-templates';

const renderTemplateIcon = (iconName: TemplateIconName, className = 'h-5 w-5') => {
  switch (iconName) {
    case 'Coffee':
      return <Coffee className={className} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'FileText':
    default:
      return <FileText className={className} />;
  }
};
import { db } from '@/lib/db';
import { sounds } from '@/utils/audio';
import { useAuthStore } from '@/stores/auth-store';
import type { AppMode, StoreSettings } from '@/types/store.types';

interface CreateStoreWizardProps {
  initialSettings?: StoreSettings | null;
  onComplete: () => void;
  onBackToWelcome: () => void;
}

export const CreateStoreWizard: React.FC<CreateStoreWizardProps> = ({
  initialSettings,
  onComplete,
  onBackToWelcome,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeName, setStoreName] = useState(initialSettings?.storeName || 'Tookoo Store');
  const [deviceName, setDeviceName] = useState(initialSettings?.deviceName || 'Kasir Utama (Tablet)');
  const [defaultCashier, setDefaultCashier] = useState(initialSettings?.defaultCashier || 'Kasir 1');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('CAFE');
  const [appMode, setAppMode] = useState<AppMode>('ADVANCED');
  const [ownerPin, setOwnerPin] = useState(initialSettings?.ownerPin || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate =
    BUSINESS_TEMPLATES.find((t) => t.id === selectedTemplateId) || BUSINESS_TEMPLATES[0];

  const handleSelectTemplate = (template: BusinessTemplate) => {
    setSelectedTemplateId(template.id);
    setAppMode(template.recommendedMode);
  };

  const handleFinishSetup = async () => {
    if (!storeName.trim()) return;

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const currentSettings = (await db.settings.toCollection().first()) || initialSettings;

      // 1. If starter products were selected, populate products into IndexedDB
      const sampleProducts = selectedTemplate.sampleProducts(now);
      if (sampleProducts.length > 0) {
        const existingCount = await db.products.count();
        if (existingCount === 0) {
          await db.products.bulkPut(sampleProducts);
        }
      }

      // 2. Save Updated Settings
      const updatedSettings: StoreSettings = {
        id: currentSettings?.id || crypto.randomUUID(),
        storeName: storeName.trim(),
        deviceName: deviceName.trim() || 'Kasir Utama',
        defaultCashier: defaultCashier.trim() || 'Kasir 1',
        appMode,
        activeRole: 'OWNER',
        ownerPin: ownerPin.trim() || undefined,
        passphrase: currentSettings?.passphrase || '',
        storeSecretKey: currentSettings?.storeSecretKey || crypto.randomUUID(),
        soundEnabled: true,
        autoPrint: false,
        isSetupComplete: true,
        createdAt: currentSettings?.createdAt || now,
        updatedAt: now,
        deletedAt: null,
      };

      await db.settings.put(updatedSettings);

      // 3. Set auth role in memory
      useAuthStore.getState().setRole('OWNER');

      sounds.playSuccess();
      onComplete();
    } catch (err) {
      console.error('Failed to complete onboarding setup:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Progress Step Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </span>
          <span
            className={`text-xs font-bold ${step === 1 ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Profil Usaha
          </span>
          <div className="h-0.5 w-6 bg-border" />

          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </span>
          <span
            className={`text-xs font-bold ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Katalog & Mode
          </span>
          <div className="h-0.5 w-6 bg-border" />

          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </span>
          <span
            className={`text-xs font-bold ${step === 3 ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Keamanan
          </span>
        </div>

        <Badge variant="outline" className="text-[10px] font-mono">
          Langkah {step} dari 3
        </Badge>
      </div>

      {/* Step 1: Profil Toko & Kasir */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              <Store className="h-4 w-4 text-primary" />
              <span>Identitas Usaha & Terminal Kasir</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Informasi ini akan tercetak di struk nota pelanggan dan menjadi nama tokomu.
            </p>
          </div>

          <Field>
            <FieldLabel className="text-xs font-bold">Nama Toko / Usaha *</FieldLabel>
            <Input
              placeholder="Contoh: Kopi Senja Utama, Warung Berkah, Toko Sembako Jaya"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="h-9 text-xs font-semibold"
              autoFocus
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field>
              <FieldLabel className="text-xs font-bold flex items-center gap-1">
                <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Perangkat Ini</span>
              </FieldLabel>
              <Input
                placeholder="Contoh: Kasir Utama, HP Kasir 1"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-bold flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Nama Kasir / Pemilik</span>
              </FieldLabel>
              <Input
                placeholder="Contoh: Budi, Siti, Kasir 1"
                value={defaultCashier}
                onChange={(e) => setDefaultCashier(e.target.value)}
                className="h-9 text-xs"
              />
            </Field>
          </div>
        </div>
      )}

      {/* Step 2: Jenis Usaha & Mode Aplikasi */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <div>
            <p className="text-xs font-bold text-foreground">
              Pilih Jenis Usaha Anda (Template Awal)
            </p>
            <p className="text-[11px] text-muted-foreground">
              Kami akan menyiapkan beberapa produk contoh siap jual agar Anda bisa langsung mencoba
              transaksi.
            </p>
          </div>

          {/* Business Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {BUSINESS_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  type="button"
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                      : 'border-border/80 bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="h-9 w-9 shrink-0 p-2 bg-muted/80 text-primary rounded-xl flex items-center justify-center border border-border/60">
                    {renderTemplateIcon(tmpl.iconName)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground truncate">{tmpl.name}</p>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* App Mode Choice */}
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-bold text-foreground">Mode Tampilan Aplikasi</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAppMode('SIMPLE')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  appMode === 'SIMPLE'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'border-border/80 bg-card hover:bg-muted/40'
                }`}
              >
                <Zap className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Mode Sederhana</p>
                  <p className="text-[10px] text-muted-foreground">
                    1-Tap bayar, cepat & ringkas
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAppMode('ADVANCED')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  appMode === 'ADVANCED'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-border/80 bg-card hover:bg-muted/40'
                }`}
              >
                <Layers className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Mode Lanjutan (Pro)</p>
                  <p className="text-[10px] text-muted-foreground">
                    Denah meja, varian & analitik
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Keamanan & PIN Pemilik */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Keamanan Toko (PIN Pemilik)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Opsional: Lindungi menu pengaturan sensitif, reset database, dan laporan omzet dengan
              PIN.
            </p>
          </div>

          <Field>
            <FieldLabel className="text-xs font-bold">PIN Keamanan (4–6 Angka) - Opsional</FieldLabel>
            <Input
              type="password"
              maxLength={6}
              placeholder="Kosongkan jika tidak ingin memakai PIN"
              value={ownerPin}
              onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
              className="h-9 text-xs font-mono tracking-widest"
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Jika dikosongkan, semua menu bisa diakses langsung tanpa sandi. Anda dapat mengaturnya
              kapan saja di menu Pengaturan.
            </p>
          </Field>

          {/* Summary Preview Card */}
          <Card className="p-3.5 bg-card border rounded-xl space-y-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Ringkasan Toko Baru Anda
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-muted-foreground">Nama Toko:</p>
                <p className="font-extrabold text-foreground">{storeName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Perangkat & Kasir:</p>
                <p className="font-semibold text-foreground">
                  {deviceName} ({defaultCashier})
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Template Usaha:</p>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  {renderTemplateIcon(selectedTemplate.iconName, 'h-3.5 w-3.5 text-primary')}
                  <span>{selectedTemplate.name}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Mode Tampilan:</p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold">
                  {appMode === 'SIMPLE' ? 'Sederhana (Lite)' : 'Lanjutan (Pro)'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Wizard Footer Navigation */}
      <div className="flex items-center justify-between pt-3 border-t mt-auto">
        {step === 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToWelcome}
            className="text-xs cursor-pointer gap-1 text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="text-xs cursor-pointer gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Sebelumnya</span>
          </Button>
        )}

        {step < 3 ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
            disabled={step === 1 && !storeName.trim()}
            className="text-xs font-bold gap-1 cursor-pointer shadow-xs"
          >
            <span>Selanjutnya</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleFinishSetup}
            disabled={isSubmitting || !storeName.trim()}
            className="text-xs font-bold gap-1.5 cursor-pointer shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Menyiapkan Toko...' : 'Buka & Mulai Kasir!'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
