import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

// Helper to map Lucide icon names to Material Symbols
export function getMaterialIcon(iconName: string | undefined): string {
  if (!iconName) return 'category';
  
  // Mapping Lucide icon names to Material Symbol equivalents
  const iconMap: Record<string, string> = {
    Utensils: 'restaurant',
    BusFront: 'directions_bus',
    Home: 'home',
    ShoppingCart: 'shopping_cart',
    PenTool: 'edit',
    BookOpen: 'menu_book',
    GraduationCap: 'school',
    Coffee: 'local_cafe',
    ShoppingBag: 'local_mall',
    Gamepad2: 'sports_esports',
    Pill: 'medication',
    Smartphone: 'smartphone',
    BellRing: 'notifications_active',
    Plane: 'flight',
    Siren: 'warning',
    Gift: 'card_giftcard',
    Package: 'inventory_2',
    Users: 'group',
  };
  
  return iconMap[iconName] || 'category';
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // Removes awkward .00 decimal clutter for students
  }).format(amount);
};
