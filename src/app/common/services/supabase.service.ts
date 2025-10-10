import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environment/environment';
import * as bcrypt from 'bcryptjs';
import { UbUserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class UbSupabaseService {
  private userService = inject(UbUserService);

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  async signIn(username: string, password: string) {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return {
        user: null,
        token: null,
        error: { message: 'Invalid username or password' },
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        user: null,
        token: null,
        error: { message: 'Invalid username or password' },
      };
    }

    const token = crypto.randomUUID();

    const { error: tokenError } = await this.supabase
      .from('user_tokens')
      .insert({
        user_id: user.id,
        user_token: token,
        is_valid: true,
      });

    if (tokenError) {
      return {
        user: null,
        token: null,
        error: { message: 'Failed to create session' },
      };
    }

    return { user, token, error: null };
  }

  async validateToken(token: string) {
    const { data: tokenData, error } = await this.supabase
      .from('user_tokens')
      .select('user_id, is_valid')
      .eq('user_token', token)
      .eq('is_valid', true)
      .single();

    if (error || !tokenData) {
      return { userId: null, error };
    }

    return { userId: tokenData.user_id, error: null };
  }

  async getUserById(userId: string) {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { user: null, error };
    }

    return { user, error: null };
  }

  async invalidateToken(token: string) {
    const { error } = await this.supabase
      .from('user_tokens')
      .update({ is_valid: false })
      .eq('user_token', token);

    return { error };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async updateUser(form: any): Promise<boolean> {
    if (!form) return false;

    const user = form.value;

    const { data, error } = await this.supabase
      .from('users')
      .update({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      this.userService.setCurrentUser(data);
      return true;
    } else {
      return false;
    }
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
