import React from 'react';
import {
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  PenTool,
  BookOpen,
  GraduationCap,
  Coffee,
  ShoppingBag,
  Gamepad2,
  Pill,
  Smartphone,
  BellRing,
  Plane,
  Siren,
  Gift,
  Package,
  Users,
  CircleDashed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  BusFront,
  Home,
  ShoppingCart,
  PenTool,
  BookOpen,
  GraduationCap,
  Coffee,
  ShoppingBag,
  Gamepad2,
  Pill,
  Smartphone,
  BellRing,
  Plane,
  Siren,
  Gift,
  Package,
  Users,
};

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  size?: number | string;
}

export function CategoryIcon({ iconName, className, size = 20 }: CategoryIconProps) {
  if (!iconName) {
    return <CircleDashed className={className} size={size} />;
  }

  const IconComponent = ICON_MAP[iconName] || CircleDashed;
  return <IconComponent className={className} size={size} />;
}
