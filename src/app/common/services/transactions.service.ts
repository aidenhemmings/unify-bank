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

  /**
   * Retrieves transactions for a specific account.
   * @param accountId - The ID of the account.
   * @param limit - Optional limit on the number of transactions to retrieve.
   * @returns A promise resolving to an object containing the transactions and any error.
   */
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

  /**
   * Retrieves all transactions for a user.
   * @param userId - The ID of the user.
   * @param limit - Optional limit on the number of transactions to retrieve.
   * @returns A promise resolving to an object containing the transactions and any error.
   */
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

  /**
   * Retrieves a transaction by its ID.
   * @param transactionId - The ID of the transaction to retrieve.
   * @returns A promise resolving to an object containing the transaction and any error.
   */
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

  /**
   * Creates a new transaction.
   * @param transaction - The transaction data to create.
   * @returns A promise resolving to an object containing the created transaction and any error.
   */
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

  /**
   * Updates an existing transaction.
   * @param transactionId - The ID of the transaction to update.
   * @param updates - The updated transaction data.
   * @returns A promise resolving to an object containing the updated transaction and any error.
   */
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

  /**
   * Deletes a transaction by its ID.
   * @param transactionId - The ID of the transaction to delete.
   * @returns A promise resolving to an object containing any error.
   */
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

  /**
   * Retrieves transactions by category for a user.
   * @param userId - The ID of the user.
   * @param category - The category of transactions to retrieve.
   * @returns A promise resolving to an object containing the transactions and any error.
   */
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

  /**
   * Retrieves monthly statistics for a user.
   * @param userId - The ID of the user.
   * @param year - The year for which to retrieve stats.
   * @param month - The month for which to retrieve stats.
   * @returns A promise resolving to an object containing income, expenses, and any error.
   */
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
