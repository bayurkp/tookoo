import React from 'react';
import {
  ShoppingBag,
  Package,
  Users,
  Building2,
  Zap,
  Megaphone,
  Wrench,
  Hammer,
  Receipt,
} from 'lucide-react';
import type { ExpenseCategory } from '@/types/expense.types';

interface ExpenseCategoryIconProps {
  category: ExpenseCategory;
  className?: string;
}

export const ExpenseCategoryIcon: React.FC<ExpenseCategoryIconProps> = ({
  category,
  className = 'h-4 w-4',
}) => {
  switch (category) {
    case 'BAHAN_BAKU':
      return <ShoppingBag className={className} />;
    case 'OPERASIONAL':
      return <Package className={className} />;
    case 'GAJI_KARYAWAN':
      return <Users className={className} />;
    case 'SEWA_TEMPAT':
      return <Building2 className={className} />;
    case 'LISTRIK_AIR':
      return <Zap className={className} />;
    case 'MARKETING':
      return <Megaphone className={className} />;
    case 'PERALATAN':
      return <Wrench className={className} />;
    case 'PERAWATAN':
      return <Hammer className={className} />;
    case 'LAINNYA':
    default:
      return <Receipt className={className} />;
  }
};

export default ExpenseCategoryIcon;
