export interface Transaction {
  id: string;
  account_id: string;
  description: string;
  amount: number;
  balance_after?: number;
  date: Date;
  type: 'credit' | 'debit';
  category: string;
  status?: string;
  reference_number?: string;
  created_at?: string;
  updated_at?: string;
}
