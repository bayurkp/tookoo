import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, UserCheck, User, Users, KeyRound, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import type { StoreSettings, UserRole } from '@/types/store.types';

interface TerminalSecurityCardProps {
  settings?: StoreSettings;
  onUpdateRole?: (role: UserRole) => void;
  onUpdatePin?: (pin: string) => void;
}

export const TerminalSecurityCard: React.FC<TerminalSecurityCardProps> = ({
  settings,
  onUpdateRole,
  onUpdatePin,
}) => {
  const { t } = useTranslation();
  const { currentRole, setRole } = useAuthStore();
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinSaved, setPinSaved] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (onUpdateRole) {
      onUpdateRole(newRole);
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePin) {
      onUpdatePin(pinInput.trim());
    }
    setIsSettingPin(false);
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 3000);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'Pemilik (Akses Penuh)';
      case 'MANAGER':
        return 'Manajer (Produk & Laporan)';
      case 'CASHIER':
        return 'Kasir (Khusus Jualan)';
    }
  };

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              {t('sync.security.title', 'Peran Terminal & Keamanan PIN')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('sync.security.desc', 'Tentukan peran perangkat ini dan amankan menu sensitif dengan PIN Pemilik.')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {pinSaved && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>PIN Pemilik Berhasil Disimpan!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Role Switcher */}
          <div className="p-3 rounded-lg border border-border/80 space-y-2 bg-card">
            <div>
              <span className="text-xs font-bold text-foreground">Peran Perangkat Ini</span>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={() => handleRoleChange('OWNER')}
                className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  currentRole === 'OWNER'
                    ? 'border-primary bg-primary/5 text-primary font-bold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
                title="Pemilik Toko (Akses Penuh)"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="text-[10px]">Pemilik</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('MANAGER')}
                className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  currentRole === 'MANAGER'
                    ? 'border-primary bg-primary/5 text-primary font-bold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
                title="Manajer (Kelola Produk & Laporan)"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="text-[10px]">Manajer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('CASHIER')}
                className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  currentRole === 'CASHIER'
                    ? 'border-primary bg-primary/5 text-primary font-bold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                }`}
                title="Kasir (Khusus Jualan)"
              >
                <User className="h-3.5 w-3.5" />
                <span className="text-[10px]">Kasir</span>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground pt-0.5">
              {getRoleLabel(currentRole)}
            </p>
          </div>

          {/* Owner PIN Management */}
          <div className="p-3 rounded-lg border border-border/80 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">PIN Pemilik</span>
              </div>
              <Badge variant={settings?.ownerPin ? 'outline' : 'secondary'} className="text-[11px] py-0">
                {settings?.ownerPin ? 'PIN Aktif' : 'Belum Ada PIN'}
              </Badge>
            </div>

            {isSettingPin ? (
              <form onSubmit={handleSavePin} className="space-y-2">
                <Input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="4-6 digit angka"
                  className="text-center font-bold tracking-widest h-8 text-xs"
                  autoFocus
                />
                <div className="flex gap-1.5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSettingPin(false)}
                    className="h-7 text-xs cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 text-xs font-bold cursor-pointer"
                    disabled={pinInput.length < 4}
                  >
                    Simpan PIN
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">
                  {settings?.ownerPin
                    ? 'PIN aktif melindungi laporan omzet dan menu pengaturan toko.'
                    : 'Pasang PIN untuk mengunci menu laporan dan pengaturan toko.'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPinInput(settings?.ownerPin || '');
                    setIsSettingPin(true);
                  }}
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
  );
};

export default TerminalSecurityCard;
