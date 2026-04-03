export const CATEGORIES = [
  { key: 'food', label: 'อาหาร', icon: '🍜', color: '#ff6b6b' },
  { key: 'transport', label: 'เดินทาง', icon: '🚇', color: '#54a0ff' },
  { key: 'shopping', label: 'ช้อปปิ้ง', icon: '🛒', color: '#feca57' },
  { key: 'health', label: 'สุขภาพ', icon: '💊', color: '#00b894' },
  { key: 'entertainment', label: 'บันเทิง', icon: '🎬', color: '#a29bfe' },
  { key: 'bills', label: 'ค่าบิล', icon: '📄', color: '#54a0ff' },
  { key: 'education', label: 'การศึกษา', icon: '📚', color: '#00b894' },
] as const;

export type DefaultCategoryKey = (typeof CATEGORIES)[number]['key'];

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // format: '2026-03'
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target: number;
  current: number;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  key: string;
  label: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
}

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
}
