import { Injectable, inject } from '@angular/core';
import { UbSupabaseService } from './supabase.service';
import { Account } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class UbAccountsService {
  private supabaseService = inject(UbSupabaseService);

  async getAccounts(
    userId: string
  ): Promise<{ accounts: Account[]; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      return { accounts: [], error };
    }

    return { accounts: data as Account[], error: null };
  }

  async getAccountById(
    accountId: string
  ): Promise<{ account: Account | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      return { account: null, error };
    }

    return { account: data as Account, error: null };
  }

  async createAccount(
    account: Partial<Account>
  ): Promise<{ account: Account | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) {
      return { account: null, error };
    }

    return { account: data as Account, error: null };
  }

  async updateAccount(
    accountId: string,
    updates: Partial<Account>
  ): Promise<{ account: Account | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      return { account: null, error };
    }

    return { account: data as Account, error: null };
  }

  async deleteAccount(accountId: string): Promise<{ error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { error } = await client
      .from('accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    return { error };
  }

  async getTotalBalance(
    userId: string
  ): Promise<{ balance: number; error: any }> {
    const { accounts, error } = await this.getAccounts(userId);

    if (error) {
      return { balance: 0, error };
    }

    const balance = accounts.reduce(
      (sum, account) => sum + (account.balance || 0),
      0
    );
    return { balance, error: null };
  }

  async updateAccountBalance(
    accountId: string,
    amount: number,
    type: 'credit' | 'debit'
  ): Promise<{ account: Account | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { account, error: fetchError } = await this.getAccountById(accountId);

    if (fetchError || !account) {
      return {
        account: null,
        error: fetchError || new Error('Account not found'),
      };
    }

    const currentBalance = account.balance || 0;
    const newBalance =
      type === 'credit' ? currentBalance + amount : currentBalance - amount;

    const { data, error } = await client
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      return { account: null, error };
    }

    return { account: data as Account, error: null };
  }
}
