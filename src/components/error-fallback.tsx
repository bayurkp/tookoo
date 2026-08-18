import React from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : error
          ? JSON.stringify(error)
          : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="max-w-md w-full border-border/80 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold">Terjadi Kendala Teknis</CardTitle>
          <CardDescription className="text-xs">
            Aplikasi mengalami kendala saat memuat halaman kasir. Data toko Anda tetap aman
            tersimpan di perangkat.
          </CardDescription>
        </CardHeader>

        {errorMessage && (
          <CardContent className="pt-2">
            <div className="p-3 rounded-lg bg-muted/50 border text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-32">
              {errorMessage}
            </div>
          </CardContent>
        )}

        <CardFooter className="pt-2 flex justify-center">
          <Button onClick={handleReload} className="gap-2 cursor-pointer text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Muat Ulang Halaman</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorFallback;
