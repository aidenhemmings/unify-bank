import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  UserId: string;
  Username: string;
  Password: string;
  FirstName: string;
  LastName: string;
  CreatedAt: string;
}

export interface AuthUser {
  supabaseUser: SupabaseUser;
  profile?: User;
}
