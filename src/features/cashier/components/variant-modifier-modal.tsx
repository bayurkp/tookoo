import React, { useState, useEffect } from 'react';
import { Plus, Minus, Check, ShoppingCart, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format-currency';
import type {
  Product,
  ProductVariantOption,
  ProductModifierOption,
  ProductModifierGroup,
} from '@/types/product.types';
import type { SelectedModifier } from '../types/cart.types';

interface VariantModifierModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariant?: ProductVariantOption,
    selectedModifiers?: SelectedModifier[]
  ) => void;
}

export const VariantModifierModal: React.FC<VariantModifierModalProps> = ({
  product,
  open,
  onOpenChange,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantOption | undefined>(
    undefined
  );
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Initialize defaults whenever modal opens for a product
  useEffect(() => {
    if (product) {
      setQuantity(1);

      // Default to first in-stock variant if variants exist
      if (product.variants && product.variants.length > 0) {
        const firstInStock = product.variants.find((v) => v.stock > 0) || product.variants[0];
        setSelectedVariant(firstInStock);
      } else {
        setSelectedVariant(undefined);
      }

      // Default selections for required modifier groups
      const initialMods: SelectedModifier[] = [];
      if (product.modifierGroups) {
        product.modifierGroups.forEach((group) => {
          if (group.required && group.options.length > 0) {
            const firstOpt = group.options[0];
            initialMods.push({
              groupId: group.id,
              groupName: group.name,
              optionId: firstOpt.id,
              name: firstOpt.name,
              price: firstOpt.price || 0,
            });
          }
        });
      }
      setSelectedModifiers(initialMods);
    }
  }, [product, open]);

  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 0;
  const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0;

  // Calculate dynamic unit price
  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const modTotal = selectedModifiers.reduce((acc, m) => acc + (m.price || 0), 0);
  const unitPrice = basePrice + modTotal;
  const totalPrice = unitPrice * quantity;

  // Max available stock for current selection
  const currentMaxStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleToggleModifier = (group: ProductModifierGroup, option: ProductModifierOption) => {
    const isSingleSelect = group.maxSelect === 1;

    setSelectedModifiers((prev) => {
      const exists = prev.some((m) => m.groupId === group.id && m.optionId === option.id);

      if (isSingleSelect) {
        // Replace selection in this group
        const filtered = prev.filter((m) => m.groupId !== group.id);
        if (exists && !group.required) {
          return filtered; // Deselect if not required
        }
        return [
          ...filtered,
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            name: option.name,
            price: option.price || 0,
          },
        ];
      }

      // Multi select
      if (exists) {
        return prev.filter((m) => !(m.groupId === group.id && m.optionId === option.id));
      }

      // Check max limit
      const currentGroupCount = prev.filter((m) => m.groupId === group.id).length;
      if (group.maxSelect && currentGroupCount >= group.maxSelect) {
        return prev;
      }

      return [
        ...prev,
        {
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          name: option.name,
          price: option.price || 0,
        },
      ];
    });
  };

  const handleConfirmAdd = () => {
    onAddToCart(product, quantity, selectedVariant, selectedModifiers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[460px] p-0 overflow-hidden max-h-[85vh] min-h-[420px] flex flex-col rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header with Product Preview */}
        <DialogHeader className="p-4 pb-3 pr-10 border-b bg-muted/20 shrink-0 text-left">
          <div className="flex items-start gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                {product.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <DialogTitle className="text-sm sm:text-base font-bold truncate text-foreground">
                  {product.name}
                </DialogTitle>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {product.category}
                </Badge>
              </div>
              {product.description && (
                <DialogDescription className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {product.description}
                </DialogDescription>
              )}
              <p className="text-sm font-extrabold text-primary font-mono mt-1">
                {formatCurrency(unitPrice)}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body: Variants & Modifiers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* 1. Variant Selection */}
          {hasVariants && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Pilih Varian *</span>
                </span>
                <span className="text-[11px] text-muted-foreground">Wajib pilih 1</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product.variants!.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isOutOfStock = variant.stock <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-2xs'
                          : isOutOfStock
                            ? 'border-border/50 opacity-40 bg-muted cursor-not-allowed'
                            : 'border-border hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs truncate">{variant.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between w-full text-[11px]">
                        <span className="font-semibold font-mono">{formatCurrency(variant.price)}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {isOutOfStock ? 'Habis' : `Stok: ${variant.stock}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Modifiers / Toppings Groups */}
          {hasModifiers &&
            product.modifierGroups!.map((group) => (
              <div key={group.id} className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-xs">{group.name}</span>
                    {group.required ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 border-primary/40 text-primary bg-primary/5"
                      >
                        Wajib
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        Opsional
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {group.maxSelect === 1 ? 'Pilih maks. 1' : 'Pilihan bebas'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.options.map((option) => {
                    const isSelected = selectedModifiers.some(
                      (m) => m.groupId === group.id && m.optionId === option.id
                    );

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleToggleModifier(group, option)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-semibold'
                            : 'border-border hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-4 w-4 ${
                              group.maxSelect === 1 ? 'rounded-full' : 'rounded-md'
                            } border flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted-foreground/40'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <span className="text-xs">{option.name}</span>
                        </div>

                        <span className="text-xs font-semibold font-mono text-muted-foreground">
                          {option.price > 0 ? `+${formatCurrency(option.price)}` : 'Gratis'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* Modal Footer with Quantity Controls & Add Button */}
        <DialogFooter className="p-3.5 sm:p-4 border-t bg-muted/20 flex flex-row items-center justify-between gap-2.5 shrink-0 sm:justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center h-10 bg-card rounded-md border border-input px-1 shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="h-8 w-8 cursor-pointer rounded-sm hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold font-mono w-7 text-center">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => Math.min(currentMaxStock, q + 1))}
              disabled={quantity >= currentMaxStock}
              className="h-8 w-8 cursor-pointer rounded-sm hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button
            type="button"
            size="default"
            onClick={handleConfirmAdd}
            disabled={currentMaxStock <= 0}
            className="flex-1 h-10 px-4 text-xs font-bold gap-2 cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span className="truncate">Tambah</span>
            </div>
            <span className="font-mono font-bold text-xs tracking-tight shrink-0">
              {formatCurrency(totalPrice)}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VariantModifierModal;
