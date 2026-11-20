'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SlidersHorizontal, BarChart3, Download, Sparkles } from 'lucide-react';

const DropdownMenuRoot = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 8, align = 'end', ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-theme-border/60 bg-theme-surface/95 p-1.5 text-theme-primary shadow-xl backdrop-blur-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItemPrimitive = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    danger?: boolean;
  }
>(({ className, inset, danger, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors duration-150',
      'focus:bg-theme-border/30 focus:text-theme-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      danger && 'text-theme-danger focus:bg-theme-danger/10 focus:text-theme-danger',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuItemPrimitive.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-theme-border/60', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

function renderDropdownIcon(icon?: string) {
  switch (icon) {
    case 'edit_note':
      return <SlidersHorizontal className="w-4 h-4 shrink-0" />;
    case 'analytics':
      return <BarChart3 className="w-4 h-4 shrink-0" />;
    case 'download':
      return <Download className="w-4 h-4 shrink-0" />;
    default:
      return <Sparkles className="w-4 h-4 shrink-0" />;
  }
}

export type DropdownMenuItem = {
  label: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
};

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}

/**
 * Accessible DropdownMenu wrapping @radix-ui/react-dropdown-menu.
 * Provides full WAI-ARIA arrow key navigation, focus return on escape,
 * and floating collision detection while maintaining 100% backward compatibility.
 */
export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className,
  menuClassName,
}: DropdownMenuProps) {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild className={className}>
        <div className="inline-flex cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2 rounded-xl">
          {trigger}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align === 'right' ? 'end' : 'start'}
        className={cn('w-56', menuClassName)}
      >
        {items.map((item, idx) => {
          const innerContent = (
            <>
              {item.icon && renderDropdownIcon(item.icon)}
              <span className="font-medium">{item.label}</span>
            </>
          );

          if (item.href) {
            return (
              <DropdownMenuItemPrimitive key={idx} asChild danger={item.danger}>
                <Link href={item.href} className="w-full">
                  {innerContent}
                </Link>
              </DropdownMenuItemPrimitive>
            );
          }

          return (
            <DropdownMenuItemPrimitive
              key={idx}
              danger={item.danger}
              onSelect={() => {
                if (item.onClick) item.onClick();
              }}
            >
              {innerContent}
            </DropdownMenuItemPrimitive>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

export {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItemPrimitive as DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
};
