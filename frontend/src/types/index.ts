export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency: string;
  monthly_income: number;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'wallet' | 'investment';
  balance: number;
  currency: string;
  institution?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  is_default: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  category_id?: string;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  is_recurring: boolean;
  recurring_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  source: 'manual' | 'csv' | 'pdf' | 'api';
  category?: Category;
  account?: Account;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold: number;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  icon: string;
  color: string;
  is_completed: boolean;
}

export interface AIInsight {
  id: string;
  user_id: string;
  type: 'anomaly' | 'forecast' | 'tip' | 'warning' | 'achievement';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  topCategories: { name: string; amount: number; color: string }[];
  recentTransactions: Transaction[];
}