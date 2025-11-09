import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UbSupabaseService } from './supabase.service';
import { Payment } from '@common/types';
import { environment } from '../../../environment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbPaymentsService {
  private http = inject(HttpClient);
  private supabaseService = inject(UbSupabaseService);
  private apiUrl = environment.apiUrl;

  async getPayments(
    userId: string
  ): Promise<{ payments: Payment[]; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payments: Payment[] }>(`${this.apiUrl}/payments`, {
          headers: this.supabaseService.getAuthHeaders(),
        })
      );

      return { payments: response.payments, error: null };
    } catch (error: any) {
      return { payments: [], error };
    }
  }

  async getPaymentById(
    paymentId: string
  ): Promise<{ payment: Payment | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payment: Payment }>(
          `${this.apiUrl}/payments/${paymentId}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { payment: response.payment, error: null };
    } catch (error: any) {
      return { payment: null, error };
    }
  }

  async createPayment(
    payment: Partial<Payment>
  ): Promise<{ payment: Payment | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ payment: Payment }>(
          `${this.apiUrl}/payments`,
          payment,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { payment: response.payment, error: null };
    } catch (error: any) {
      return { payment: null, error };
    }
  }

  async updatePayment(
    paymentId: string,
    updates: Partial<Payment>
  ): Promise<{ payment: Payment | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.put<{ payment: Payment }>(
          `${this.apiUrl}/payments/${paymentId}`,
          updates,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { payment: response.payment, error: null };
    } catch (error: any) {
      return { payment: null, error };
    }
  }

  async cancelPayment(paymentId: string): Promise<{ error: any }> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/payments/${paymentId}/cancel`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async getPendingPayments(
    userId: string
  ): Promise<{ payments: Payment[]; count: number; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payments: Payment[]; count: number }>(
          `${this.apiUrl}/payments/pending`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return {
        payments: response.payments,
        count: response.count,
        error: null,
      };
    } catch (error: any) {
      return { payments: [], count: 0, error };
    }
  }

  async getPaymentsByStatus(
    userId: string,
    status: Payment['status']
  ): Promise<{ payments: Payment[]; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payments: Payment[] }>(
          `${this.apiUrl}/payments/status/${status}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { payments: response.payments, error: null };
    } catch (error: any) {
      return { payments: [], error };
    }
  }

  async processPayment(
    paymentId: string
  ): Promise<{ result: any; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ result: any }>(
          `${this.apiUrl}/payments/${paymentId}/process`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { result: response.result, error: null };
    } catch (error: any) {
      return { result: null, error };
    }
  }

  async processScheduledPayments(): Promise<{ result: any; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ result: any }>(
          `${this.apiUrl}/payments/process-scheduled`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      return { result: response.result, error: null };
    } catch (error: any) {
      return { result: null, error };
    }
  }
}
