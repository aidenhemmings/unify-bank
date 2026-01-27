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

  /**
   * Asynchronous function to get payments for a user.
   * @param userId The ID of the user.
   * @returns A promise resolving to an object containing payments and any error.
   */
  async getPayments(
    userId: string,
  ): Promise<{ payments: Payment[]; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payments: Payment[] }>(`${this.apiUrl}/payments`, {
          headers: this.supabaseService.getAuthHeaders(),
        }),
      );

      return { payments: response.payments, error: null };
    } catch (error: any) {
      return { payments: [], error };
    }
  }

  /**
   * Retrieves a specific payment by its ID.
   * @param paymentId - The ID of the payment to retrieve.
   * @returns A promise resolving to an object containing the payment and any error.
   */
  async getPaymentById(
    paymentId: string,
  ): Promise<{ payment: Payment | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payment: Payment }>(
          `${this.apiUrl}/payments/${paymentId}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return { payment: response.payment, error: null };
    } catch (error: any) {
      return { payment: null, error };
    }
  }

  /**
   * Creates a new payment.
   * @param payment - The payment data to create.
   * @returns A promise resolving to an object containing the created payment, requires_approval flag, and any error.
   */
  async createPayment(
    payment: Partial<Payment>,
  ): Promise<{
    payment: Payment | null;
    requires_approval: boolean;
    error: any;
  }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ payment: Payment; requires_approval: boolean }>(
          `${this.apiUrl}/payments`,
          payment,
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return {
        payment: response.payment,
        requires_approval: response.requires_approval,
        error: null,
      };
    } catch (error: any) {
      return { payment: null, requires_approval: false, error };
    }
  }

  /**
   * Updates a payment.
   * @param paymentId - The ID of the payment to update.
   * @param updates - The updated payment data.
   * @returns A promise resolving to an object containing the updated payment and any error.
   */
  async updatePayment(
    paymentId: string,
    updates: Partial<Payment>,
  ): Promise<{ payment: Payment | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.put<{ payment: Payment }>(
          `${this.apiUrl}/payments/${paymentId}`,
          updates,
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return { payment: response.payment, error: null };
    } catch (error: any) {
      return { payment: null, error };
    }
  }

  /**
   * Cancels a payment by its ID.
   * @param paymentId - The ID of the payment to cancel.
   * @returns A promise resolving to an object containing any error.
   */
  async cancelPayment(paymentId: string): Promise<{ error: any }> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.apiUrl}/payments/${paymentId}/cancel`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Retrieves pending payments for a user.
   * @param userId - The ID of the user to retrieve pending payments for.
   * @returns A promise resolving to an object containing the payments, count, and any error.
   */
  async getPendingPayments(
    userId: string,
  ): Promise<{ payments: Payment[]; count: number; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payments: Payment[]; count: number }>(
          `${this.apiUrl}/payments/pending`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
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

  /**
   * Retrieves payments by their status for a specific user.
   * @param userId - The ID of the user to retrieve payments for.
   * @param status - The status of the payments to retrieve.
   * @returns A promise resolving to an object containing the payments and any error.
   */
  async getPaymentsByStatus(
    userId: string,
    status: Payment['status'],
  ): Promise<{ payments: Payment[]; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payments: Payment[] }>(
          `${this.apiUrl}/payments/status/${status}`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return { payments: response.payments, error: null };
    } catch (error: any) {
      return { payments: [], error };
    }
  }

  /**
   * Processes a payment by its ID.
   * @param paymentId - The ID of the payment to process.
   * @returns A promise resolving to an object containing the result and any error.
   */
  async processPayment(
    paymentId: string,
  ): Promise<{ result: any; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ result: any }>(
          `${this.apiUrl}/payments/${paymentId}/process`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return { result: response.result, error: null };
    } catch (error: any) {
      return { result: null, error };
    }
  }

  /**
   * Processes scheduled payments.
   * @returns A promise resolving to an object containing the result and any error.
   */
  async processScheduledPayments(): Promise<{ result: any; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ result: any }>(
          `${this.apiUrl}/payments/process-scheduled`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return { result: response.result, error: null };
    } catch (error: any) {
      return { result: null, error };
    }
  }

  /**
   * Retrieves incoming pending payments that require approval from the current user.
   * @returns A promise resolving to an object containing the payments, count, and any error.
   */
  async getIncomingPendingPayments(): Promise<{
    payments: Payment[];
    count: number;
    error: any;
  }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ payments: Payment[]; count: number }>(
          `${this.apiUrl}/payments/incoming-pending`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
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

  /**
   * Approves an incoming payment.
   * @param paymentId - The ID of the payment to approve.
   * @returns A promise resolving to an object containing the result and any error.
   */
  async approvePayment(
    paymentId: string,
  ): Promise<{ success: boolean; payment: Payment | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; payment: Payment }>(
          `${this.apiUrl}/payments/${paymentId}/approve`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return {
        success: response.success,
        payment: response.payment,
        error: null,
      };
    } catch (error: any) {
      return { success: false, payment: null, error };
    }
  }

  /**
   * Declines an incoming payment.
   * @param paymentId - The ID of the payment to decline.
   * @param reason - Optional reason for declining.
   * @returns A promise resolving to an object containing the result and any error.
   */
  async declinePayment(
    paymentId: string,
    reason?: string,
  ): Promise<{ success: boolean; payment: Payment | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; payment: Payment }>(
          `${this.apiUrl}/payments/${paymentId}/decline`,
          { reason },
          {
            headers: this.supabaseService.getAuthHeaders(),
          },
        ),
      );

      return {
        success: response.success,
        payment: response.payment,
        error: null,
      };
    } catch (error: any) {
      return { success: false, payment: null, error };
    }
  }
}
