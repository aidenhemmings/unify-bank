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
