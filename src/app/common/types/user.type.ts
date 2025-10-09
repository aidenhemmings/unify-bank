import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface AuthUser {
  supabaseUser: SupabaseUser;
  profile?: User;
}
