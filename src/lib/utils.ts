import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

// Helper to map Lucide icon names to Material Symbols
export const getMaterialIcon = (lucideName: string = 'Package') => {
 const map: Record<string, string> = {
 Utensils: 'restaurant',
 BusFront: 'directions_bus',
 Home: 'home',
 Film: 'movie',
 Shirt: 'apparel',
 HeartPulse: 'monitor_heart',
 GraduationCap: 'school',
 Package: 'category'
 };
 return map[lucideName] || 'category';
};
