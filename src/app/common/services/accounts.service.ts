import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UbSupabaseService } from './supabase.service';
import { Account } from '@common/types';
import { environment } from '../../../environment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbAccountsService {
  private http = inject(HttpClient);
  private supabaseService = inject(UbSupabaseService);
  private apiUrl = environment.apiUrl;

  /**
   * Retrieves all accounts for a given user.
   * @param userId - The ID of the user whose accounts are to be retrieved.
   * @returns A promise resolving to an object containing the accounts and any error.
   */
  async getAccounts(
    userId: string
  ): Promise<{ accounts: Account[]; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ accounts: Account[] }>(`${this.apiUrl}/accounts`, {
          headers: this.supabaseService.getAuthHeaders(),
        })
      );

      return { accounts: response.accounts, error: null };
    } catch (error: any) {
      return { accounts: [], error };
    }
  }

  /**
   * Retrieves a specific account by its ID.
   * @param accountId - The ID of the account to retrieve.
   * @returns A promise resolving to an object containing the account and any error.
   */
  async getAccountById(
    accountId: string
  ): Promise<{ account: Account | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ account: Account }>(
          `${this.apiUrl}/accounts/${accountId}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { account: response.account, error: null };
    } catch (error: any) {
      return { account: null, error };
    }
  }

  /**
   * Creates a new account.
   * @param account - The account details to create.
   * @returns A promise resolving to an object containing the created account and any error.
   */
  async createAccount(
    account: Partial<Account>
  ): Promise<{ account: Account | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ account: Account }>(
          `${this.apiUrl}/accounts`,
          account,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { account: response.account, error: null };
    } catch (error: any) {
      return { account: null, error };
    }
  }

  /**
   * Updates an existing account.
   * @param accountId - The ID of the account to update.
   * @param updates - The updates to apply to the account.
   * @returns A promise resolving to an object containing the updated account and any error.
   */
  async updateAccount(
    accountId: string,
    updates: Partial<Account>
  ): Promise<{ account: Account | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.put<{ account: Account }>(
          `${this.apiUrl}/accounts/${accountId}`,
          updates,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { account: response.account, error: null };
    } catch (error: any) {
      return { account: null, error };
    }
  }

  /**
   * Deletes an account by its ID.
   * @param accountId - The ID of the account to delete.
   * @returns A promise resolving to an object containing any error.
   */

  async deleteAccount(accountId: string): Promise<{ error: any }> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/accounts/${accountId}`, {
          headers: this.supabaseService.getAuthHeaders(),
        })
      );

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Retrieves the total balance across all accounts for a given user.
   * @param userId - The ID of the user whose total balance is to be retrieved.
   * @returns A promise resolving to an object containing the total balance and any error.
   */
  async getTotalBalance(
    userId: string
  ): Promise<{ balance: number; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ balance: number }>(
          `${this.apiUrl}/accounts/total-balance`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { balance: response.balance, error: null };
    } catch (error: any) {
      return { balance: 0, error };
    }
  }

  /**
   * Updates the balance of an account.
   * @param accountId - The ID of the account whose balance is to be updated.
   * @param amount - The amount to add or subtract from the account's balance.
   * @param type - Whether the operation is a credit (add) or debit (subtract).
   * @returns A promise resolving to an object containing the updated account and any error.
   */
  async updateAccountBalance(
    accountId: string,
    amount: number,
    type: 'credit' | 'debit'
  ): Promise<{ account: Account | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.patch<{ account: Account }>(
          `${this.apiUrl}/accounts/${accountId}/balance`,
          { amount, type },
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { account: response.account, error: null };
    } catch (error: any) {
      return { account: null, error };
    }
  }
}
