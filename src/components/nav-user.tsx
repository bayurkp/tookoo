import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronsUpDown,
  Shield,
  Sliders,
  Database,
  Store,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAppMode } from '@/hooks/use-app-mode';
import { PinModal } from '@/components/pin-modal';
import { loadProfessionalDemoData } from '@/features/settings/data/demo-data';
import { sounds } from '@/utils/audio';
import type { UserRole, StoreSettings } from '@/types/store.types';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    role: string;
    deviceName: string;
    storeName?: string;
  };
}) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentRole, setRole } = useAuthStore();
  const { appMode, setAppMode } = useAppMode();

  const { data: settings } = useQuery<StoreSettings | null>({
    queryKey: ['settings'],
    queryFn: async () => {
      return (await db.settings.toCollection().first()) || null;
    },
  });

  const updateSettingsRole = async (newRole: UserRole) => {
    if (settings?.id) {
      await db.settings.update(settings.id, {
        activeRole: newRole,
        updatedAt: Date.now(),
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  };

  const [pinModalOpen, setPinModalOpen] = React.useState(false);
  const [pendingRole, setPendingRole] = React.useState<UserRole | null>(null);
  const [demoConfirmOpen, setDemoConfirmOpen] = React.useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = React.useState(false);

  const handleLoadDemoData = async () => {
    setIsLoadingDemo(true);
    try {
      await loadProfessionalDemoData();
      sounds.playSuccess();
      await queryClient.invalidateQueries();
      setDemoConfirmOpen(false);
    } catch (err) {
      console.error('Failed to load demo data:', err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const isRolePromotion = (targetRole: UserRole) => {
    const roleRank: Record<UserRole, number> = {
      CASHIER: 1,
      MANAGER: 2,
      OWNER: 3,
    };
    return roleRank[targetRole] > roleRank[currentRole];
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === currentRole) return;

    if (isRolePromotion(newRole) && settings?.ownerPin) {
      setPendingRole(newRole);
      setPinModalOpen(true);
    } else {
      setRole(newRole);
      updateSettingsRole(newRole);
    }
  };

  const handlePinSuccess = () => {
    if (pendingRole) {
      setRole(pendingRole);
      updateSettingsRole(pendingRole);
      setPendingRole(null);
    }
  };

  const isNameSameAsRole = user.name.toLowerCase().trim() === user.role.toLowerCase().trim();
  const subtitle = isNameSameAsRole
    ? `${user.storeName || 'Tookoo POS'} • ${user.deviceName || 'Terminal Kasir'}`
    : `${user.storeName ? `${user.storeName} • ` : ''}${user.role}`;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                  <span className="truncate font-bold text-foreground">{user.name}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{subtitle}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-1.5 text-left text-xs">
                  <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                    <span className="truncate font-bold text-foreground">{user.name}</span>
                    <span className="truncate text-[10px] text-muted-foreground">{subtitle}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Display Mode Selection */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">
                  {t('auth.viewMode', 'Mode Tampilan')}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setAppMode('SIMPLE')}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="size-3.5" />
                    <span>{t('auth.simpleMode', 'Mode Sederhana')}</span>
                  </div>
                  {appMode === 'SIMPLE' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setAppMode('ADVANCED')}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="size-3.5" />
                    <span>{t('auth.advancedMode', 'Mode Lengkap')}</span>
                  </div>
                  {appMode === 'ADVANCED' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {/* Role Switcher */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1">
                  {t('auth.switchRole', 'Ganti Hak Akses')}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleSwitchRole('CASHIER')}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="size-3.5" />
                    <span>{t('auth.roles.cashier', 'Kasir')}</span>
                  </div>
                  {currentRole === 'CASHIER' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleSwitchRole('MANAGER')}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="size-3.5" />
                    <span>{t('auth.roles.manager', 'Manajer Toko')}</span>
                  </div>
                  {currentRole === 'MANAGER' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleSwitchRole('OWNER')}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="size-3.5" />
                    <span>{t('auth.roles.owner', 'Pemilik Toko')}</span>
                  </div>
                  {currentRole === 'OWNER' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {/* Navigation Shortcuts */}
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => navigate('/store-profile')}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Store className="size-3.5" />
                  <span>{t('nav.items.storeProfile', 'Profil Toko')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/settings?tab=security')}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Shield className="size-3.5" />
                  <span>{t('nav.items.security', 'Keamanan & PIN')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/settings?tab=data')}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Database className="size-3.5" />
                  <span>{t('nav.items.dataBackup', 'Cadangkan Data')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Load Demo Data Shortcut */}
                <DropdownMenuItem
                  onClick={() => setDemoConfirmOpen(true)}
                  className="text-xs gap-2 cursor-pointer text-primary focus:text-primary font-medium"
                >
                  <Sparkles className="size-3.5" />
                  <span>Muat Data Demo Toko</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Owner PIN Authorization Modal */}
      <PinModal
        open={pinModalOpen}
        onOpenChange={setPinModalOpen}
        correctPin={settings?.ownerPin}
        title={t('auth.pinModalTitle', 'Otorisasi PIN Pemilik')}
        description={t('auth.pinModalDesc', 'Masukkan PIN Pemilik untuk mengubah peran terminal.', {
          role:
            pendingRole === 'OWNER'
              ? t('auth.roles.owner', 'Pemilik Toko')
              : t('auth.roles.manager', 'Manajer Toko'),
        })}
        onSuccess={handlePinSuccess}
      />

      {/* Load Demo Data Confirmation Dialog */}
      <Dialog open={demoConfirmOpen} onOpenChange={setDemoConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-5 text-primary" />
              <span>Muat Data Demo Toko Lengkap?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Sistem akan memuat data profesional pasar Indonesia: produk kuliner Nusantara lengkap
              dengan varian & gambar, denah meja, pelanggan, vendor supplier, serta riwayat
              transaksi untuk demonstrasi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoConfirmOpen(false)}
              disabled={isLoadingDemo}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleLoadDemoData}
              disabled={isLoadingDemo}
              className="gap-2"
            >
              {isLoadingDemo && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isLoadingDemo ? 'Memuat Data...' : 'Muat Data Demo'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NavUser;
