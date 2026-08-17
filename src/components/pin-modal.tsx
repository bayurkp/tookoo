import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { useAuthStore } from '@/stores/auth-store';

interface PinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  correctPin?: string;
  title?: string;
  description?: string;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  open,
  onOpenChange,
  correctPin,
  title,
  description,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!correctPin) {
      // No PIN configured, allow access
      onSuccess();
      onOpenChange(false);
      return;
    }

    if (pin.trim() === correctPin.trim()) {
      useAuthStore.getState().unlock(15);
      setError(null);
      setPin('');
      onSuccess();
      onOpenChange(false);
    } else {
      setError(t('auth.invalidPin', 'PIN yang Anda masukkan salah. Coba lagi.'));
      setPin('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">
              {title || t('auth.pinTitle', 'Otorisasi Pemilik Toko')}
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              {description ||
                t(
                  'auth.pinDesc',
                  'Masukkan 4-6 digit PIN Pemilik untuk melanjutkan tindakan ini.'
                )}
            </DialogDescription>
          </DialogHeader>

          <Field data-invalid={Boolean(error)} className="space-y-2 py-2">
            <FieldLabel htmlFor="owner-pin-input" className="sr-only">
              PIN Pemilik
            </FieldLabel>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="owner-pin-input"
                type="password"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                placeholder="• • • • • •"
                aria-invalid={Boolean(error)}
                className="text-center text-xl font-bold tracking-widest pl-10 h-12"
              />
            </div>
            <FieldError errors={[{ message: error || undefined }]} />
          </Field>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null);
                setPin('');
                onOpenChange(false);
              }}
            >
              {t('common.actions.cancel', 'Batal')}
            </Button>
            <Button type="submit" disabled={pin.length < 4}>
              {t('auth.unlockBtn', 'Buka Akses')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinModal;
