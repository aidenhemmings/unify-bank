import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UbSupabaseService } from './supabase.service';
import { Transaction } from '@common/types';
import { environment } from '../../../environment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbTransactionsService {
  private http = inject(HttpClient);
  private supabaseService = inject(UbSupabaseService);
  private apiUrl = environment.apiUrl;

  async getTransactions(
    accountId: string,
    limit?: number
  ): Promise<{ transactions: Transaction[]; error: any }> {
    try {
      let params = new HttpParams();
      if (limit) {
        params = params.set('limit', limit.toString());
      }

      const response = await firstValueFrom(
        this.http.get<{ transactions: Transaction[] }>(
          `${this.apiUrl}/transactions/account/${accountId}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
            params,
          }
        )
      );

      return {
        transactions: response.transactions.map((t) => ({
          ...t,
          date: t.created_at ? new Date(t.created_at) : new Date(),
        })),
        error: null,
      };
    } catch (error: any) {
      return { transactions: [], error };
    }
  }

  async getAllTransactionsForUser(
    userId: string,
    limit?: number
  ): Promise<{ transactions: Transaction[]; error: any }> {
    try {
      let params = new HttpParams();
      if (limit) {
        params = params.set('limit', limit.toString());
      }

      const response = await firstValueFrom(
        this.http.get<{ transactions: Transaction[] }>(
          `${this.apiUrl}/transactions`,
          {
            headers: this.supabaseService.getAuthHeaders(),
            params,
          }
        )
      );

      return {
        transactions: response.transactions.map((t: any) => ({
          ...t,
          date: t.created_at ? new Date(t.created_at) : new Date(),
        })),
        error: null,
      };
    } catch (error: any) {
      return { transactions: [], error };
    }
  }

  async getTransactionById(
    transactionId: string
  ): Promise<{ transaction: Transaction | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ transaction: Transaction }>(
          `${this.apiUrl}/transactions/${transactionId}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return {
        transaction: {
          ...response.transaction,
          date: response.transaction.created_at
            ? new Date(response.transaction.created_at)
            : new Date(),
        },
        error: null,
      };
    } catch (error: any) {
      return { transaction: null, error };
    }
  }

  async createTransaction(
    transaction: Partial<Transaction>
  ): Promise<{ transaction: Transaction | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ transaction: Transaction }>(
          `${this.apiUrl}/transactions`,
          transaction,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return {
        transaction: {
          ...response.transaction,
          date: response.transaction.created_at
            ? new Date(response.transaction.created_at)
            : new Date(),
        },
        error: null,
      };
    } catch (error: any) {
      return { transaction: null, error };
    }
  }

  async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<{ transaction: Transaction | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.put<{ transaction: Transaction }>(
          `${this.apiUrl}/transactions/${transactionId}`,
          updates,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return {
        transaction: {
          ...response.transaction,
          date: response.transaction.created_at
            ? new Date(response.transaction.created_at)
            : new Date(),
        },
        error: null,
      };
    } catch (error: any) {
      return { transaction: null, error };
    }
  }

  async deleteTransaction(transactionId: string): Promise<{ error: any }> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/transactions/${transactionId}`, {
          headers: this.supabaseService.getAuthHeaders(),
        })
      );

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async getTransactionsByCategory(
    userId: string,
    category: string
  ): Promise<{ transactions: Transaction[]; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ transactions: Transaction[] }>(
          `${this.apiUrl}/transactions/category/${category}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return {
        transactions: response.transactions.map((t: any) => ({
          ...t,
          date: t.created_at ? new Date(t.created_at) : new Date(),
        })),
        error: null,
      };
    } catch (error: any) {
      return { transactions: [], error };
    }
  }

  async getMonthlyStats(
    userId: string,
    year: number,
    month: number
  ): Promise<{ income: number; expenses: number; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ income: number; expenses: number }>(
          `${this.apiUrl}/transactions/stats/${year}/${month}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return {
        income: response.income,
        expenses: response.expenses,
        error: null,
      };
    } catch (error: any) {
      return { income: 0, expenses: 0, error };
    }
  }
}
