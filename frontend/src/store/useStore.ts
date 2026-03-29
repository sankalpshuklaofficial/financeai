import { create } from 'zustand';
import { User, Transaction, Account, Budget, SavingsGoal } from '@/types';

interface FinanceStore {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Data
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;

  accounts: Account[];
  setAccounts: (a: Account[]) => void;

  budgets: Budget[];
  setBudgets: (b: Budget[]) => void;

  savingsGoals: SavingsGoal[];
  setSavingsGoals: (g: SavingsGoal[]) => void;

  // UI
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export const useStore = create<FinanceStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  transactions: [],
  setTransactions: (transactions) => set({ transactions }),

  accounts: [],
  setAccounts: (accounts) => set({ accounts }),

  budgets: [],
  setBudgets: (budgets) => set({ budgets }),

  savingsGoals: [],
  setSavingsGoals: (savingsGoals) => set({ savingsGoals }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
