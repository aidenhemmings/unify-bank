export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  account_number: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
