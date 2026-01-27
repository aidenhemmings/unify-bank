import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from './admin.type';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  is_active?: boolean;
  created_at: string;
}

export interface AuthUser {
  supabaseUser: SupabaseUser;
  profile?: User;
}
