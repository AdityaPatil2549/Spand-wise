import { IExpenseRepository } from './IExpenseRepository';
import { firestoreExpenseRepository } from './FirestoreExpenseRepository';
import { dexieExpenseRepository } from './DexieExpenseRepository';

export * from './IExpenseRepository';
export * from './FirestoreExpenseRepository';
export * from './DexieExpenseRepository';

/**
 * Factory providing the active expense repository implementation.
 * Defaults to the high-performance, local-first DexieExpenseRepository.
 */
export function getExpenseRepository(): IExpenseRepository {
  return dexieExpenseRepository;
}

export const expenseRepository: IExpenseRepository = dexieExpenseRepository;
