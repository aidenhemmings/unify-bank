export interface Payment {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_number: string;
  recipient_name: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_type: 'one-time' | 'recurring';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  scheduled_date?: Date;
  completed_at?: Date;
  created_at: string;
  updated_at: string;
}
