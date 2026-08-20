import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Save,
  Building2,
  UserCheck,
  MapPin,
  Phone,
  Check,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  useOutlets,
  useUpsertOutlet,
  useDeleteOutlet,
  useActiveOutlet,
  useSetActiveOutlet,
} from '@/features/outlets/hooks/use-outlets';
import { OutletFormDialog } from '@/features/outlets/components/outlet-form-dialog';
import { useStaffList, useUpsertStaff, useDeleteStaff } from '@/features/staff/hooks/use-staff';
import { StaffFormDialog } from '@/features/staff/components/staff-form-dialog';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/utils/currency-config';
import { sounds } from '@/utils/audio';
import type { CurrencyCode } from '@/types/currency.types';
import type { Outlet, Staff } from '@/types/store.types';

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

      {/* Domain Section: Branch & Outlet Management */}
      <OutletManagementSection />

      {/* Domain Section: Staff & Cashier Management */}
      <StaffManagementSection />

      {/* Onboarding Setup Wizard Dialog */}
      <WelcomeOnboardingDialog forceOpen={isSetupWizardOpen} onOpenChange={setIsSetupWizardOpen} />
    </div>
  );
};

// Subcomponent: Outlet Management Section
const OutletManagementSection: React.FC = () => {
  const { data: outlets = [], isLoading } = useOutlets();
  const { activeOutlet } = useActiveOutlet();
  const upsertMutation = useUpsertOutlet();
  const deleteMutation = useDeleteOutlet();
  const setActiveMutation = useSetActiveOutlet();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [outletToEdit, setOutletToEdit] = useState<Outlet | null>(null);

  const handleOpenCreate = () => {
    setOutletToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (outlet: Outlet) => {
    setOutletToEdit(outlet);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: Partial<Outlet> & { name: string }) => {
    await upsertMutation.mutateAsync(data);
    sounds.playSuccess();
  };

  const handleDelete = async (id: string) => {
    if (outlets.length <= 1) {
      alert('Toko harus memiliki minimal 1 cabang utama.');
      return;
    }
    if (confirm('Hapus cabang outlet ini?')) {
      await deleteMutation.mutateAsync(id);
      sounds.playDelete();
    }
  };

  const handleSetActive = async (id: string) => {
    await setActiveMutation.mutateAsync(id);
    sounds.playSuccess();
  };

  return (
    <Card className="border bg-card rounded-xl shadow-none">
      <CardHeader className="p-5 pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Manajemen Cabang & Outlet ({outlets.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Kelola cabang fisik toko untuk pembagian stok, kasir, dan laporan terpisah.
            </CardDescription>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="gap-1.5 text-xs font-bold shrink-0 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Cabang</span>
        </Button>
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Memuat data cabang...
          </div>
        ) : outlets.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Belum ada cabang terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {outlets.map((outlet) => {
              const isActive = outlet.id === activeOutlet?.id;
              return (
                <div
                  key={outlet.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                    isActive
                      ? 'border-primary/50 bg-primary/5 shadow-xs'
                      : 'border-border/70 bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-foreground truncate">{outlet.name}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {outlet.isHQ && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 font-bold bg-primary/10 text-primary border-primary/20"
                          >
                            HQ / Pusat
                          </Badge>
                        )}
                        {isActive && (
                          <Badge
                            variant="default"
                            className="text-[9px] px-1.5 py-0 font-bold bg-emerald-600 text-white"
                          >
                            Aktif di Terminal Ini
                          </Badge>
                        )}
                      </div>
                    </div>

                    {outlet.address && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{outlet.address}</span>
                      </p>
                    )}

                    {outlet.phone && (
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{outlet.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t gap-2 text-xs">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => handleSetActive(outlet.id)}
                        className="text-primary font-bold hover:underline cursor-pointer text-xs"
                      >
                        Aktifkan di Terminal Ini
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Terminal Aktif</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(outlet)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </Button>
                      {!outlet.isHQ && outlets.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(outlet.id)}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <OutletFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        outletToEdit={outletToEdit}
        onSave={handleSave}
      />
    </Card>
  );
};

// Subcomponent: Staff & Cashier Management Section
const StaffManagementSection: React.FC = () => {
  const { data: staffList = [], isLoading } = useStaffList();
  const { data: outlets = [] } = useOutlets();
  const upsertMutation = useUpsertStaff();
  const deleteMutation = useDeleteStaff();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);

  const handleOpenCreate = () => {
    setStaffToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setStaffToEdit(staff);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: Partial<Staff> & { name: string }) => {
    await upsertMutation.mutateAsync(data);
    sounds.playSuccess();
  };

  const handleDelete = async (id: string) => {
    if (staffList.length <= 1) {
      alert('Toko harus memiliki minimal 1 akun staf.');
      return;
    }
    if (confirm('Hapus akun staf ini?')) {
      await deleteMutation.mutateAsync(id);
      sounds.playDelete();
    }
  };

  return (
    <Card className="border bg-card rounded-xl shadow-none">
      <CardHeader className="p-5 pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Manajemen Staf & Kasir ({staffList.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Daftarkan kasir, atur PIN otentikasi cepat, dan tentukan penugasan cabang tempat
              bertugas.
            </CardDescription>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="gap-1.5 text-xs font-bold shrink-0 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Staf</span>
        </Button>
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">Memuat data staf...</div>
        ) : staffList.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Belum ada staf terdaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {staffList.map((staff) => {
              const assignedOutlets = staff.hasAllOutlets
                ? 'Semua Cabang (Global)'
                : staff.outletIds.length > 0
                  ? outlets
                      .filter((o) => staff.outletIds.includes(o.id))
                      .map((o) => o.name)
                      .join(', ') || 'Belum ditugaskan'
                  : 'Belum ditugaskan';

              return (
                <div
                  key={staff.id}
                  className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-foreground truncate">{staff.name}</p>
                      <Badge
                        variant={
                          staff.role === 'OWNER'
                            ? 'default'
                            : staff.role === 'MANAGER'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-[9px] px-1.5 py-0 font-bold shrink-0"
                      >
                        {staff.role === 'OWNER'
                          ? 'Owner'
                          : staff.role === 'MANAGER'
                            ? 'Manajer'
                            : 'Kasir'}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Building2 className="h-3 w-3 shrink-0 text-primary" />
                      <span>{assignedOutlets}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      {staff.pin ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="h-3 w-3" />
                          <span>PIN Aktif</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Tanpa PIN</span>
                      )}

                      {staff.phone && (
                        <span className="truncate flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{staff.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-3 mt-3 border-t gap-1 text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(staff)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </Button>
                    {staff.role !== 'OWNER' && staffList.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(staff.id)}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <StaffFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        staffToEdit={staffToEdit}
        onSave={handleSave}
      />
    </Card>
  );
};

export default StoreProfilePage;
