import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronsUpDown, Shield, Sliders, Database, Store, Check } from 'lucide-react';
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
import type { UserRole, StoreSettings } from '@/types/store.types';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    role: string;
    deviceName: string;
  };
}) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentRole, setRole } = useAuthStore();
  const { mode, setMode } = useAppMode();

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

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-bold text-foreground">{user.name}</span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {user.role} • {user.deviceName}
                  </span>
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
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-bold text-foreground">{user.name}</span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {user.role} • {user.deviceName}
                    </span>
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
                  onClick={() => setMode('simple')}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="size-3.5" />
                    <span>{t('auth.simpleMode', 'Mode Sederhana (Lite)')}</span>
                  </div>
                  {mode === 'simple' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setMode('advanced')}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="size-3.5" />
                    <span>{t('auth.advancedMode', 'Mode Lengkap (Pro)')}</span>
                  </div>
                  {mode === 'advanced' && <Check className="size-3.5 text-primary" />}
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
                    <span>{t('auth.roles.owner', 'Pemilik (Owner)')}</span>
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
    </>
  );
}

export default NavUser;
