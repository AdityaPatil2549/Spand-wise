import type { ExpenseDocument, CategoryDocument } from '@/types/firestore';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export function exportExpensesToExcel(
  expenses: ExpenseDocument[],
  categories: CategoryDocument[],
  customFilename?: string
) {
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  // Prepare data for Excel
  const data = expenses.map((expense) => ({
    'Date': format(expense.date.toDate(), 'dd-MM-yyyy'),
    'Time': format(expense.date.toDate(), 'HH:mm'),
    'Amount': expense.amount,
    'Category': categoryMap[expense.categoryId] || 'Unknown',
    'Note': expense.note || '',
    'Account': expense.accountId || 'cash',
    'Type': expense.type || 'expense'
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Define explicit column widths (in characters)
  worksheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 8 },  // Time
    { wch: 12 }, // Amount
    { wch: 15 }, // Category
    { wch: 35 }, // Note
    { wch: 12 }, // Account
    { wch: 10 }  // Type
  ];

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

  // Trigger download
  const filename = customFilename || `SpendWise_Backup_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
