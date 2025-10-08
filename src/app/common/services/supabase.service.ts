import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  User,
  Session,
} from '@supabase/supabase-js';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UbSupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getSession(): Promise<{ session: Session | null; error: any }> {
    const { data, error } = await this.supabase.auth.getSession();
    return { session: data.session, error };
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
