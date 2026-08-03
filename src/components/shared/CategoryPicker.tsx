'use client';

import { useStore } from '@/store';
import { clsx } from 'clsx';
import type { CategoryDocument } from '@/types/firestore';

interface CategoryPickerProps {
 selectedId: string;
 onSelect: (categoryId: string) => void;
}

/**
 * Horizontal scrollable category chip selector.
 * Used inside the Add/Edit Expense bottom sheet.
 */
export const CategoryPicker = ({ selectedId, onSelect }: CategoryPickerProps) => {
 const categories = useStore((s) => s.categories);

 return (
 <div
 className="flex gap-2 overflow-x-auto scrollbar-none py-1 -mx-4 px-4"
 role="listbox"
 aria-label="Select category"
 >
 {categories.map((cat) => (
 <CategoryChip
 key={cat.id}
 category={cat}
 isSelected={cat.id === selectedId}
 onSelect={onSelect}
 />
 ))}
 </div>
 );
};

interface CategoryChipProps {
 category: CategoryDocument;
 isSelected: boolean;
 onSelect: (id: string) => void;
}

import { CategoryIcon } from '@/components/shared/CategoryIcon';

const CategoryChip = ({ category, isSelected, onSelect }: CategoryChipProps) => (
 <button
 type="button"
 role="option"
 aria-selected={isSelected}
 onClick={() => onSelect(category.id)}
 className={clsx(
 'flex flex-col items-center gap-1 flex-shrink-0 px-3 py-2 rounded-2xl',
 'transition-[transform,background-color,border-color,opacity,box-shadow] duration-150 ease-out min-w-[64px]',
 'touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent active:scale-[0.97]',
 isSelected
 ? 'scale-[1.02] shadow-sm'
 : 'opacity-70 hover:opacity-100 hover:bg-theme-border/20'
 )}
 style={{
 backgroundColor: isSelected ? `${category.color}22` : '#eae2da',
 border: isSelected
 ? `2px solid ${category.color}88`
 : '2px solid transparent',
 }}
 >
 <div className="flex items-center justify-center h-8 w-8 text-xl" style={{ color: category.color }} aria-hidden="true">
 {category.icon ? <CategoryIcon iconName={category.icon} size={24} /> : category.emoji}
 </div>
 <span
 className="text-[10px] font-medium leading-tight text-center font-body"
 style={{ color: isSelected ? category.color : '#605850' }}
 >
 {category.name.split(' ')[0]}
 </span>
 </button>
);
