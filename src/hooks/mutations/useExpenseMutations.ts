'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import {
  addExpense,
  editExpense,
  softDeleteExpense,
  restoreExpense,
  parseExpenseDate,
} from '@/lib/expenses';
import { getLocalMonthString } from '@/lib/date-sharding';
import { useStore } from '@/store';
import { EXPENSES_QUERY_KEY, getExpensesQueryKey } from '@/hooks/queries/useExpensesQuery';
import type { ExpenseDocument } from '@/types/firestore';
import type { AddExpenseInput, EditExpenseInput } from '@/types/forms';

export interface AddExpenseMutationVariables {
  householdId: string;
  userId: string;
  input: AddExpenseInput;
}

export interface DeleteExpenseMutationVariables {
  householdId: string;
  expense: ExpenseDocument;
}

export interface UpdateExpenseMutationVariables {
  householdId: string;
  input: EditExpenseInput;
  previousExpense: ExpenseDocument;
}

export interface RestoreExpenseMutationVariables {
  householdId: string;
  expense: ExpenseDocument;
}

/**
 * Mutation hook to add an expense with zero-latency optimistic UI update
 * and deterministic rollback across both TanStack Query and Zustand.
 */
export function useAddExpenseMutation() {
  const queryClient = useQueryClient();
  const { loadedMonths, addExpenseOptimistic, removeExpenseOptimistic } = useStore();

  return useMutation({
    mutationFn: ({ householdId, userId, input }: AddExpenseMutationVariables) =>
      addExpense(householdId, userId, input),

    onMutate: async ({ householdId, userId, input }) => {
      const queryKey = getExpensesQueryKey(householdId, loadedMonths);

      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });

      const previousExpenses = queryClient.getQueryData<ExpenseDocument[]>(queryKey) ?? [];

      const parsedDate = parseExpenseDate(input.date);
      const month = getLocalMonthString(parsedDate);
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const optimisticExpense: ExpenseDocument = {
        id: tempId,
        amount: input.amount,
        categoryId: input.categoryId,
        note: input.note?.trim() || null,
        date: Timestamp.fromDate(parsedDate),
        month,
        isDeleted: false,
        type: input.type || 'expense',
        createdAt: Timestamp.now(),
        createdBy: userId,
        accountId: input.accountId || 'cash',
      };

      // Optimistically update TanStack Query cache
      queryClient.setQueryData<ExpenseDocument[]>(queryKey, (old = []) => [
        optimisticExpense,
        ...old,
      ]);

      // Optimistically update Zustand store
      addExpenseOptimistic(optimisticExpense);

      return { previousExpenses, queryKey, tempId };
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousExpenses);
        removeExpenseOptimistic(context.tempId);
      }
    },

    onSettled: (_data, _error, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });
      queryClient.invalidateQueries({ queryKey: ['budget', householdId] });
    },
  });
}

/**
 * Mutation hook to soft-delete an expense with immediate UI removal
 * and automatic undo rollback capabilities.
 */
export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();
  const { loadedMonths, removeExpenseOptimistic, restoreExpenseOptimistic } = useStore();

  return useMutation({
    mutationFn: ({ householdId, expense }: DeleteExpenseMutationVariables) =>
      softDeleteExpense(
        householdId,
        expense.id,
        expense.amount,
        expense.month,
        expense.type,
        expense.accountId || 'cash'
      ),

    onMutate: async ({ householdId, expense }) => {
      const queryKey = getExpensesQueryKey(householdId, loadedMonths);

      await queryClient.cancelQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });

      const previousExpenses = queryClient.getQueryData<ExpenseDocument[]>(queryKey) ?? [];

      // Optimistically remove from TanStack Query cache
      queryClient.setQueryData<ExpenseDocument[]>(queryKey, (old = []) =>
        old.filter((e) => e.id !== expense.id)
      );

      // Optimistically remove from Zustand store
      removeExpenseOptimistic(expense.id);

      return { previousExpenses, queryKey, expense };
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousExpenses);
        restoreExpenseOptimistic(context.expense);
      }
    },

    onSettled: (_data, _error, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });
      queryClient.invalidateQueries({ queryKey: ['budget', householdId] });
    },
  });
}

/**
 * Mutation hook to edit an expense with immediate cache update and rollback.
 */
export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();
  const { loadedMonths, updateExpenseOptimistic } = useStore();

  return useMutation({
    mutationFn: ({ householdId, input, previousExpense }: UpdateExpenseMutationVariables) =>
      editExpense(
        householdId,
        input,
        previousExpense.amount,
        previousExpense.month,
        previousExpense.type,
        previousExpense.accountId || 'cash'
      ),

    onMutate: async ({ householdId, input }) => {
      const queryKey = getExpensesQueryKey(householdId, loadedMonths);

      await queryClient.cancelQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });

      const previousExpenses = queryClient.getQueryData<ExpenseDocument[]>(queryKey) ?? [];

      const parsedDate = parseExpenseDate(input.date);
      const newMonth = getLocalMonthString(parsedDate);

      // Optimistically patch cache
      queryClient.setQueryData<ExpenseDocument[]>(queryKey, (old = []) =>
        old.map((e) =>
          e.id === input.id
            ? {
                ...e,
                amount: input.amount,
                categoryId: input.categoryId,
                note: input.note?.trim() || null,
                date: Timestamp.fromDate(parsedDate),
                month: newMonth,
                type: input.type || 'expense',
                accountId: input.accountId || 'cash',
              }
            : e
        )
      );

      // Optimistically patch Zustand store
      updateExpenseOptimistic({
        id: input.id,
        amount: input.amount,
        categoryId: input.categoryId,
        note: input.note?.trim() || null,
        date: Timestamp.fromDate(parsedDate),
        month: newMonth,
        type: input.type || 'expense',
        accountId: input.accountId || 'cash',
      });

      return { previousExpenses, queryKey };
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousExpenses);
      }
    },

    onSettled: (_data, _error, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });
      queryClient.invalidateQueries({ queryKey: ['budget', householdId] });
    },
  });
}

/**
 * Mutation hook to restore a previously deleted expense (Undo action).
 */
export function useRestoreExpenseMutation() {
  const queryClient = useQueryClient();
  const { loadedMonths, restoreExpenseOptimistic, removeExpenseOptimistic } = useStore();

  return useMutation({
    mutationFn: ({ householdId, expense }: RestoreExpenseMutationVariables) =>
      restoreExpense(
        householdId,
        expense.id,
        expense.amount,
        expense.month,
        expense.type,
        expense.accountId || 'cash'
      ),

    onMutate: async ({ householdId, expense }) => {
      const queryKey = getExpensesQueryKey(householdId, loadedMonths);

      await queryClient.cancelQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });

      const previousExpenses = queryClient.getQueryData<ExpenseDocument[]>(queryKey) ?? [];

      // Optimistically restore in query cache
      queryClient.setQueryData<ExpenseDocument[]>(queryKey, (old = []) => [expense, ...old]);

      // Optimistically restore in Zustand store
      restoreExpenseOptimistic(expense);

      return { previousExpenses, queryKey, expense };
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousExpenses);
        removeExpenseOptimistic(context.expense.id);
      }
    },

    onSettled: (_data, _error, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_QUERY_KEY, householdId] });
      queryClient.invalidateQueries({ queryKey: ['budget', householdId] });
    },
  });
}
