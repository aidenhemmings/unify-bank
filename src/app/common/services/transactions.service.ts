import { Injectable, inject } from '@angular/core';
import { UbSupabaseService } from './supabase.service';
import { Transaction } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class UbTransactionsService {
  private supabaseService = inject(UbSupabaseService);

  async getTransactions(
    accountId: string,
    limit?: number
  ): Promise<{ transactions: Transaction[]; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    let query = client
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return { transactions: [], error };
    }

    return {
      transactions: data.map((t) => ({
        ...t,
        date: new Date(t.created_at),
      })) as Transaction[],
      error: null,
    };
  }

  async getAllTransactionsForUser(
    userId: string,
    limit?: number
  ): Promise<{ transactions: Transaction[]; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    let query = client
      .from('transactions')
      .select('*, accounts!inner(user_id)')
      .eq('accounts.user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return { transactions: [], error };
    }

    return {
      transactions: data.map((t) => ({
        id: t.id,
        account_id: t.account_id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        status: t.status,
        reference_number: t.reference_number,
        date: new Date(t.created_at),
        created_at: t.created_at,
        updated_at: t.updated_at,
      })) as Transaction[],
      error: null,
    };
  }

  async getTransactionById(
    transactionId: string
  ): Promise<{ transaction: Transaction | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      return { transaction: null, error };
    }

    return {
      transaction: {
        ...data,
        date: new Date(data.created_at),
      } as Transaction,
      error: null,
    };
  }

  async createTransaction(
    transaction: Partial<Transaction>
  ): Promise<{ transaction: Transaction | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      return { transaction: null, error };
    }

    return {
      transaction: {
        ...data,
        date: new Date(data.created_at),
      } as Transaction,
      error: null,
    };
  }

  async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<{ transaction: Transaction | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      return { transaction: null, error };
    }

    return {
      transaction: {
        ...data,
        date: new Date(data.created_at),
      } as Transaction,
      error: null,
    };
  }

  async deleteTransaction(transactionId: string): Promise<{ error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    return { error };
  }

  async getTransactionsByCategory(
    userId: string,
    category: string
  ): Promise<{ transactions: Transaction[]; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('transactions')
      .select('*, accounts!inner(user_id)')
      .eq('accounts.user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      return { transactions: [], error };
    }

    return {
      transactions: data.map((t) => ({
        ...t,
        date: new Date(t.created_at),
      })) as Transaction[],
      error: null,
    };
  }

  async getMonthlyStats(
    userId: string,
    year: number,
    month: number
  ): Promise<{ income: number; expenses: number; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const { data, error } = await client
      .from('transactions')
      .select('amount, type, accounts!inner(user_id)')
      .eq('accounts.user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'completed');

    if (error) {
      return { income: 0, expenses: 0, error };
    }

    const income = data
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenses = data
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expenses, error: null };
  }
}
