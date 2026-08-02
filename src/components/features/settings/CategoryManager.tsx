'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { CategoryForm } from './CategoryForm';
import { MAX_CUSTOM_CATEGORIES } from '@/config/constants';
import { Edit2, Trash2 } from 'lucide-react';
import type { CategoryDocument } from '@/types/firestore';
import { deleteCustomCategory } from '@/lib/categories/index';

export const CategoryManager = () => {
  const { user, householdId, categories, removeCategoryOptimistic, addToast } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDocument | null>(null);

  const customCategories = categories.filter((c) => !c.isDefault);
  const presetCategories = categories.filter((c) => c.isDefault);

  const canAddMore = customCategories.length < MAX_CUSTOM_CATEGORIES;

  const handleEdit = (category: CategoryDocument) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (category: CategoryDocument) => {
    if (!householdId) return;
    if (confirm(`Are you sure you want to delete "${category.name}"? Existing expenses will show as "Misc".`)) {
      try {
        await deleteCustomCategory(householdId, category.id);
        removeCategoryOptimistic(category.id);
        addToast({ type: 'success', message: 'Category deleted' });
      } catch (err: any) {
        addToast({ type: 'error', message: 'Failed to delete category' });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Custom Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-[#3a302a]">Custom Categories</h4>
          <span className="text-xs font-semibold px-2 py-1 bg-[#eae2da] text-[#78706a] rounded-full">
            {customCategories.length} / {MAX_CUSTOM_CATEGORIES}
          </span>
        </div>
        
        {customCategories.length === 0 ? (
          <p className="text-sm text-[#78706a] italic p-4 bg-[#f2ece4] rounded-xl border border-[#d8d0c8]/50">
            No custom categories yet. Add one below!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-[#f2ece4] rounded-xl border border-[#d8d0c8]/50 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
                    {cat.icon ? <CategoryIcon iconName={cat.icon} size={16} /> : cat.emoji}
                  </div>
                  <span className="font-medium text-sm text-[#3a302a]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(cat)} className="p-1.5 text-[#78706a] hover:text-[#3a302a] hover:bg-[#eae2da] rounded-md transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
            disabled={!canAddMore}
          >
            + Add Custom Category
          </Button>
          {!canAddMore && <p className="text-xs text-[#78706a] mt-2">You have reached the maximum number of custom categories.</p>}
        </div>
      </div>

      {/* Preset Categories */}
      <div className="pt-6 border-t border-[#d8d0c8]/30">
        <h4 className="font-medium text-[#3a302a] mb-4">Preset Categories (Default)</h4>
        <div className="flex flex-wrap gap-2">
          {presetCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-[#eae2da]/50 rounded-full border border-[#d8d0c8]/30">
              <span style={{ color: cat.color }} className="text-xs">
                {cat.icon ? <CategoryIcon iconName={cat.icon} size={14} /> : cat.emoji}
              </span>
              <span className="text-xs font-medium text-[#78706a]">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {isFormOpen && (
        <CategoryForm 
          editingCategory={editingCategory} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};
