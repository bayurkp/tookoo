import React, { useState, useRef } from 'react';
import {
  Printer,
  Type,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  QrCode,
  Store,
  X,
  Loader2,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { compressImageToWebP } from '@/utils/image-compressor';
import { formatCurrency } from '@/utils/format-currency';
import {
  DEFAULT_RECEIPT_SETTINGS,
  type ReceiptSettings,
  type StoreSettings,
} from '@/types/store.types';

interface ReceiptSettingsSectionProps {
  settings: StoreSettings | null;
  onSave: (receiptSettings: ReceiptSettings) => Promise<void>;
}

export const ReceiptSettingsSection: React.FC<ReceiptSettingsSectionProps> = ({
  settings,
  onSave,
}) => {
  const initial = settings?.receiptSettings || DEFAULT_RECEIPT_SETTINGS;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(initial.paperWidth || '58mm');
  const [fontFamily, setFontFamily] = useState<'monospace' | 'sans-serif' | 'serif'>(
    initial.fontFamily || 'monospace'
  );
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>(
    initial.fontSize || 'normal'
  );
  const [headerTitle, setHeaderTitle] = useState(initial.headerTitle || settings?.storeName || '');
  const [headerSubtitle, setHeaderSubtitle] = useState(
    initial.headerSubtitle || 'Smart, Fast & Trustworthy POS'
  );
  const [storeAddress, setStoreAddress] = useState(
    initial.storeAddress || settings?.storeAddress || ''
  );
  const [storePhone, setStorePhone] = useState(initial.storePhone || '');
  const [showLogo, setShowLogo] = useState(Boolean(initial.showLogo));
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl || '');
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);

  // Visibility Toggles
  const [showQueueNumber, setShowQueueNumber] = useState(initial.showQueueNumber !== false);
  const [showCashierName, setShowCashierName] = useState(initial.showCashierName !== false);
  const [showOrderNumber, setShowOrderNumber] = useState(initial.showOrderNumber !== false);
  const [showCustomerName, setShowCustomerName] = useState(initial.showCustomerName !== false);
  const [showSku, setShowSku] = useState(Boolean(initial.showSku));
  const [showModifiers, setShowModifiers] = useState(initial.showModifiers !== false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(
    initial.showPaymentDetails !== false
  );
  const [showTaxService, setShowTaxService] = useState(Boolean(initial.showTaxService));
  const [taxRatePercent, setTaxRatePercent] = useState<number>(initial.taxRatePercent ?? 11);
  const [serviceRatePercent, setServiceRatePercent] = useState<number>(
    initial.serviceRatePercent ?? 5
  );
  const [showBarcodeQr, setShowBarcodeQr] = useState(initial.showBarcodeQr !== false);

  // Footer fields
  const [footerMessage, setFooterMessage] = useState(
    initial.footerMessage || 'Terima kasih atas kunjungan Anda!'
  );
  const [footerSocialMedia, setFooterSocialMedia] = useState(
    initial.footerSocialMedia || 'Instagram: @tookooid'
  );
  const [footerPolicy, setFooterPolicy] = useState(
    initial.footerPolicy || 'Barang yang sudah dibeli tidak dapat ditukar.'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingLogo(true);
      const webp = await compressImageToWebP(file, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.85,
      });
      setLogoUrl(webp);
      setShowLogo(true);
    } catch (err) {
      console.error('Failed to compress logo:', err);
    } finally {
      setIsCompressingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setShowLogo(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: ReceiptSettings = {
        paperWidth,
        fontFamily,
        fontSize,
        headerTitle: headerTitle.trim() || settings?.storeName || 'Tookoo Store',
        headerSubtitle: headerSubtitle.trim(),
        storeAddress: storeAddress.trim(),
        storePhone: storePhone.trim(),
        showLogo,
        logoUrl,
        showQueueNumber,
        showCashierName,
        showOrderNumber,
        showCustomerName,
        showSku,
        showModifiers,
        showPaymentDetails,
        showTaxService,
        taxRatePercent,
        serviceRatePercent,
        showBarcodeQr,
        footerMessage: footerMessage.trim(),
        footerSocialMedia: footerSocialMedia.trim(),
        footerPolicy: footerPolicy.trim(),
      };

      await onSave(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save receipt settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPrint = () => {
    window.print();
  };

  // Font CSS Class helpers for the live receipt
  const getFontFamilyClass = () => {
    if (fontFamily === 'monospace') return 'font-mono';
    if (fontFamily === 'serif') return 'font-serif';
    return 'font-sans';
  };

  const getFontSizeClass = () => {
    if (fontSize === 'small') return 'text-[11px] leading-tight';
    if (fontSize === 'large') return 'text-[13px] leading-relaxed';
    return 'text-xs leading-normal';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column (Span 7): Settings Form Controls */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Card 1: Kertas & Tipografi */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center gap-3 space-y-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Maximize2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Ukuran Kertas & Tipografi
                </CardTitle>
                <CardDescription className="text-xs">
                  Atur lebar kertas printer thermal dan jenis huruf yang dicetak.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Ukuran Kertas Thermal *</FieldLabel>
                  <Select value={paperWidth} onValueChange={(val) => setPaperWidth(val as any)}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Pilih Ukuran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="58mm">58 mm (Standar POS)</SelectItem>
                        <SelectItem value="80mm">80 mm (POS Besar)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Jenis Font *</FieldLabel>
                  <Select value={fontFamily} onValueChange={(val) => setFontFamily(val as any)}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Pilih Font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="monospace">Monospace (Thermal)</SelectItem>
                        <SelectItem value="sans-serif">Clean Sans-Serif</SelectItem>
                        <SelectItem value="serif">Serif (Klasik)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Ukuran Huruf *</FieldLabel>
                  <Select value={fontSize} onValueChange={(val) => setFontSize(val as any)}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Pilih Ukuran Huruf" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="small">Kecil (Hemat Kertas)</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Besar (Mudah Dibaca)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Header & Logo Toko */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center gap-3 space-y-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Identitas & Header Nota
                </CardTitle>
                <CardDescription className="text-xs">
                  Informasi toko dan logo yang dicetak di bagian paling atas nota.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Nama Toko di Header Nota</FieldLabel>
                  <Input
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    placeholder={settings?.storeName || 'Nama Toko Anda'}
                    className="h-9 text-xs font-semibold"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">Slogan / Sub-judul Toko</FieldLabel>
                  <Input
                    value={headerSubtitle}
                    onChange={(e) => setHeaderSubtitle(e.target.value)}
                    placeholder="Contoh: Coffee & Eatery, Fresh Daily"
                    className="h-9 text-xs"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Alamat Toko di Struk</FieldLabel>
                  <Input
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Jl. Merdeka No. 12, Jakarta"
                    className="h-9 text-xs"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">No. Telepon / WhatsApp Toko</FieldLabel>
                  <Input
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="h-9 text-xs font-mono"
                  />
                </Field>
              </div>

              {/* Logo Upload Section */}
              <div className="pt-1">
                <FieldLabel className="text-xs font-bold mb-1.5 block">
                  Logo Nota (Opsional)
                </FieldLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {logoUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/80">
                    <img
                      src={logoUrl}
                      alt="Logo Nota"
                      className="h-12 w-12 object-contain rounded-lg border bg-white p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground">Logo Struk Aktif</p>
                        <Badge variant="outline" className="text-[10px]">
                          WebP
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Checkbox
                          id="toggle-show-logo"
                          checked={showLogo}
                          onCheckedChange={(checked) => setShowLogo(Boolean(checked))}
                        />
                        <label
                          htmlFor="toggle-show-logo"
                          className="text-[11px] text-muted-foreground cursor-pointer select-none"
                        >
                          Cetak Logo di Struk
                        </label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressingLogo}
                    className="w-full h-11 border-dashed border-2 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
                  >
                    {isCompressingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-primary" />
                    )}
                    <span>
                      {isCompressingLogo
                        ? 'Mengompres Logo...'
                        : 'Upload Logo Toko (Monokrom / Hitam Putih)'}
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Isi Konten & Elemen yang Ditampilkan */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center gap-3 space-y-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Visibilitas Konten & Rincian Struk
                </CardTitle>
                <CardDescription className="text-xs">
                  Pilih rincian transaksi apa saja yang ditampilkan pada kertas struk.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Nomor Antrean Besar */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-queue"
                    checked={showQueueNumber}
                    onCheckedChange={(checked) => setShowQueueNumber(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-queue"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      Nomor Antrean Besar (Queue #)
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Sangat cocok untuk F&B / Coffee Shop
                    </span>
                  </div>
                </div>

                {/* 2. Nama Kasir */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-cashier"
                    checked={showCashierName}
                    onCheckedChange={(checked) => setShowCashierName(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-cashier"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      Nama Kasir Petugas
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Menampilkan nama petugas yang melayani
                    </span>
                  </div>
                </div>

                {/* 3. Nomor Struk & Tanggal */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-order-num"
                    checked={showOrderNumber}
                    onCheckedChange={(checked) => setShowOrderNumber(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-order-num"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      Nomor Struk & Waktu Transaksi
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      ID unik order dan jam/menit transaksi
                    </span>
                  </div>
                </div>

                {/* 4. Meja / Nama Pelanggan */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-customer"
                    checked={showCustomerName}
                    onCheckedChange={(checked) => setShowCustomerName(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-customer"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      Nama Pelanggan / No. Meja
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Catatan dine-in atau nama pembeli
                    </span>
                  </div>
                </div>

                {/* 5. Rincian Modifier & Topping */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-modifiers"
                    checked={showModifiers}
                    onCheckedChange={(checked) => setShowModifiers(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-modifiers"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      Rincian Modifier / Topping
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Misal: +Extra Boba, Level Gula
                    </span>
                  </div>
                </div>

                {/* 6. SKU Produk */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-sku"
                    checked={showSku}
                    onCheckedChange={(checked) => setShowSku(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-sku"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      Kode SKU Produk
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Kode barang untuk toko retail
                    </span>
                  </div>
                </div>

                {/* 7. Detail Pembayaran & Kembalian */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-payment"
                    checked={showPaymentDetails}
                    onCheckedChange={(checked) => setShowPaymentDetails(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-payment"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      Detail Bayar & Kembalian
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Tunai diterima dan uang kembalian
                    </span>
                  </div>
                </div>

                {/* 8. QR Code / Barcode Struk */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    id="show-barcode"
                    checked={showBarcodeQr}
                    onCheckedChange={(checked) => setShowBarcodeQr(Boolean(checked))}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="show-barcode"
                      className="text-xs font-semibold cursor-pointer block select-none"
                    >
                      QR Code Verifikasi Struk
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Untuk scan verifikasi dan klaim garansi
                    </span>
                  </div>
                </div>
              </div>

              {/* Pajak & Service Charge Sub-Section */}
              <div className="pt-2 border-t mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-tax"
                      checked={showTaxService}
                      onCheckedChange={(checked) => setShowTaxService(Boolean(checked))}
                    />
                    <label
                      htmlFor="show-tax"
                      className="text-xs font-bold cursor-pointer select-none"
                    >
                      Aktifkan Rincian Pajak (PPN / PB1) & Service Charge
                    </label>
                  </div>
                </div>

                {showTaxService && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <Field>
                      <FieldLabel className="text-[11px] font-bold">Tarif Pajak (%)</FieldLabel>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={taxRatePercent}
                        onChange={(e) => setTaxRatePercent(Number(e.target.value) || 0)}
                        className="h-8 text-xs font-bold"
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-[11px] font-bold">
                        Tarif Service Charge (%)
                      </FieldLabel>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={serviceRatePercent}
                        onChange={(e) => setServiceRatePercent(Number(e.target.value) || 0)}
                        className="h-8 text-xs font-bold"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Footer & Pesan Penutup */}
          <Card className="border bg-card rounded-xl shadow-none">
            <CardHeader className="p-4 pb-3 border-b flex flex-row items-center gap-3 space-y-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Type className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Pesan Footer & Penutup
                </CardTitle>
                <CardDescription className="text-xs">
                  Kalimat ucapan terima kasih dan informasi media sosial di bagian bawah nota.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Field>
                <FieldLabel className="text-xs font-bold">Pesan Ucapan Terima Kasih</FieldLabel>
                <Input
                  value={footerMessage}
                  onChange={(e) => setFooterMessage(e.target.value)}
                  placeholder="Contoh: Terima kasih atas kunjungan Anda!"
                  className="h-9 text-xs"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel className="text-xs font-bold">Media Sosial / Website</FieldLabel>
                  <Input
                    value={footerSocialMedia}
                    onChange={(e) => setFooterSocialMedia(e.target.value)}
                    placeholder="Contoh: Instagram @tokokita.id"
                    className="h-9 text-xs"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold">
                    Kebijakan Toko / Catatan Retur
                  </FieldLabel>
                  <Input
                    value={footerPolicy}
                    onChange={(e) => setFooterPolicy(e.target.value)}
                    placeholder="Contoh: Barang yang dibeli tidak dapat ditukar"
                    className="h-9 text-xs"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestPrint}
              className="gap-2 text-xs font-bold cursor-pointer"
            >
              <Printer className="h-4 w-4 text-primary" />
              <span>Cetak Uji Coba Printer</span>
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 text-xs font-bold cursor-pointer shadow-xs min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simpan Format Nota</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Column (Span 5): Live Realistic Thermal Receipt Preview */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-primary" />
            <p className="text-xs font-bold text-foreground">
              Pratinjau Nota Langsung (Live Preview)
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {paperWidth} | {fontFamily}
          </Badge>
        </div>

        {/* Thermal Paper Simulation Container */}
        <div className="bg-muted/40 p-4 rounded-2xl border border-dashed flex justify-center items-start overflow-x-auto min-h-[560px]">
          <div
            className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-5 rounded-sm shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all ${getFontFamilyClass()} ${getFontSizeClass()}`}
            style={{
              width: paperWidth === '58mm' ? '280px' : '360px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Perforated paper jagged top simulator */}
            <div className="text-center pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
              {showLogo && logoUrl && (
                <div className="flex justify-center mb-1.5">
                  <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                </div>
              )}
              <h3 className="font-extrabold text-base tracking-tight uppercase">
                {headerTitle || settings?.storeName || 'Tookoo Store'}
              </h3>
              {headerSubtitle && (
                <p className="text-[10px] opacity-75 font-medium mt-0.5">{headerSubtitle}</p>
              )}
              {storeAddress && <p className="text-[10px] opacity-80 mt-0.5">{storeAddress}</p>}
              {storePhone && <p className="text-[10px] opacity-80 mt-0.5">Telp: {storePhone}</p>}
            </div>

            {/* Queue Number Banner (If Enabled) */}
            {showQueueNumber && (
              <div className="my-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded text-center border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] font-bold opacity-75 block uppercase tracking-wider">
                  Nomor Antrean
                </span>
                <span className="text-2xl font-black tracking-wider font-mono">#A-042</span>
              </div>
            )}

            {/* Order Meta Info */}
            <div className="py-2 space-y-0.5 text-[11px] border-b border-dashed border-zinc-300 dark:border-zinc-700">
              {showOrderNumber && (
                <div className="flex justify-between">
                  <span className="opacity-70">No. Nota:</span>
                  <span className="font-mono font-bold">ORD-2026-0818-001</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="opacity-70">Tanggal:</span>
                <span>18 Agu 2026, 08:30</span>
              </div>
              {showCashierName && (
                <div className="flex justify-between">
                  <span className="opacity-70">Kasir:</span>
                  <span>{settings?.defaultCashier || 'Budi Kasir'}</span>
                </div>
              )}
              {showCustomerName && (
                <div className="flex justify-between">
                  <span className="opacity-70">Pelanggan:</span>
                  <span className="font-bold">Meja 04 (Bpk. Andre)</span>
                </div>
              )}
            </div>

            {/* Itemized Sold Products */}
            <div className="py-2.5 space-y-2 border-b border-dashed border-zinc-300 dark:border-zinc-700">
              {/* Item 1 */}
              <div>
                <div className="flex justify-between font-bold">
                  <span>Es Kopi Susu Aren</span>
                  <span>{formatCurrency(18000)}</span>
                </div>
                {showSku && <p className="text-[9px] opacity-60 font-mono">SKU: KOP-AREN-01</p>}
                <div className="flex justify-between text-[10px] opacity-80">
                  <span>1 cup x {formatCurrency(18000)}</span>
                </div>
                {showModifiers && (
                  <div className="text-[10px] opacity-70 pl-2">
                    <p>• Suhu: Dingin</p>
                    <p>• +Ekstra Boba Brown Sugar (+Rp3.000)</p>
                  </div>
                )}
              </div>

              {/* Item 2 */}
              <div>
                <div className="flex justify-between font-bold">
                  <span>Roti Bakar Keju Melted</span>
                  <span>{formatCurrency(30000)}</span>
                </div>
                {showSku && <p className="text-[9px] opacity-60 font-mono">SKU: ROTI-KEJU-02</p>}
                <div className="flex justify-between text-[10px] opacity-80">
                  <span>2 porsi x {formatCurrency(15000)}</span>
                </div>
              </div>
            </div>

            {/* Calculations & Totals */}
            <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="flex justify-between">
                <span className="opacity-70">Subtotal</span>
                <span>{formatCurrency(48000)}</span>
              </div>

              {showTaxService && (
                <>
                  <div className="flex justify-between text-[10px] opacity-80">
                    <span>PB1 / Pajak ({taxRatePercent}%)</span>
                    <span>{formatCurrency(Math.round(48000 * (taxRatePercent / 100)))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] opacity-80">
                    <span>Service Charge ({serviceRatePercent}%)</span>
                    <span>{formatCurrency(Math.round(48000 * (serviceRatePercent / 100)))}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <span>TOTAL AKHIR</span>
                <span className="font-mono">
                  {formatCurrency(
                    showTaxService
                      ? Math.round(48000 * (1 + (taxRatePercent + serviceRatePercent) / 100))
                      : 48000
                  )}
                </span>
              </div>

              {showPaymentDetails && (
                <div className="pt-1 text-[10px] opacity-80 space-y-0.5 border-t border-dashed border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span>Metode Bayar:</span>
                    <span className="font-semibold">TUNAI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uang Diterima:</span>
                    <span className="font-mono">{formatCurrency(50000)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Kembalian:</span>
                    <span className="font-mono">
                      {formatCurrency(
                        showTaxService
                          ? 50000 -
                              Math.round(48000 * (1 + (taxRatePercent + serviceRatePercent) / 100))
                          : 2000
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Closing Messages & QR */}
            <div className="pt-3 text-center space-y-1">
              {showBarcodeQr && (
                <div className="flex flex-col items-center justify-center pb-1">
                  <div className="p-1 bg-white border rounded">
                    <QrCode className="h-14 w-14 text-black" />
                  </div>
                  <span className="text-[9px] font-mono opacity-60 mt-0.5">ORD-2026-0818-001</span>
                </div>
              )}

              {footerMessage && <p className="font-bold text-[11px]">{footerMessage}</p>}
              {footerSocialMedia && <p className="text-[10px] opacity-75">{footerSocialMedia}</p>}
              {footerPolicy && <p className="text-[9px] opacity-60 italic">{footerPolicy}</p>}

              <p className="text-[8px] opacity-40 pt-1 font-mono">
                Printed by Tookoo POS • 100% Offline P2P
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptSettingsSection;
