export interface Payment {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_number: string;
  recipient_name: string;
  amount: number;
  currency: string;
  description?: string;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'declined';
  payment_type: 'one-time' | 'recurring';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  scheduled_date?: Date;
  completed_at?: Date;
  created_at: string;
  updated_at: string;
  recipient_user_id?: string;
  recipient_account_id?: string;
  requires_approval?: boolean;
  declined_at?: Date;
  decline_reason?: string;
  sender_name?: string;
  from_account_name?: string;
}
