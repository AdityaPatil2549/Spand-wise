'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addCustomCategory, updateCustomCategory } from '@/lib/categories/index';
import type { CategoryDocument } from '@/types/firestore';
import { X } from 'lucide-react';

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#f43f5e', // rose
];

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(20, 'Max 20 characters'),
  emoji: z.string().min(1, 'Emoji is required').max(2, 'Only 1 emoji allowed'),
  color: z.string().min(1, 'Color is required'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  editingCategory: CategoryDocument | null;
  onClose: () => void;
}

export const CategoryForm = ({ editingCategory, onClose }: CategoryFormProps) => {
  const { user, householdId, addToast, addCategoryOptimistic, updateCategoryOptimistic } = useStore();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: editingCategory?.name || '',
      emoji: editingCategory?.emoji || '🏷️',
      color: editingCategory?.color || COLORS[0],
    },
  });

  const selectedColor = watch('color');

  const onSubmit = async (data: CategoryFormValues) => {
    if (!householdId || !user) return;

    try {
      if (editingCategory) {
        await updateCustomCategory(householdId, editingCategory.id, data);
        updateCategoryOptimistic({ ...editingCategory, ...data });
        addToast({ type: 'success', message: 'Category updated' });
      } else {
        const newCat = await addCustomCategory(householdId, data);
        addCategoryOptimistic(newCat);
        addToast({ type: 'success', message: 'Category added' });
      }
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save category' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#faf5ee] w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#d8d0c8]/50 bg-white">
          <h3 className="font-headline text-xl text-[#3a302a]">
            {editingCategory ? 'Edit Category' : 'New Category'}
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-[#78706a] hover:text-[#3a302a] rounded-full hover:bg-[#eae2da] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Emoji Icon"
            placeholder="e.g. 🍿"
            {...register('emoji')}
            error={errors.emoji?.message}
          />

          <div>
            <label className="block text-sm font-medium text-[#78706a] mb-3 uppercase tracking-widest">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-[#c2652a] scale-110' : 'hover:scale-110 shadow-sm'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            {errors.color && (
              <p className="mt-2 text-sm text-red-500">{errors.color.message}</p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
