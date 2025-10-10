import { Injectable, inject } from '@angular/core';
import { UbSupabaseService } from './supabase.service';
import { Payment } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class UbPaymentsService {
  private supabaseService = inject(UbSupabaseService);

  async getPayments(
    userId: string
  ): Promise<{ payments: Payment[]; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { payments: [], error };
    }

    return { payments: data as Payment[], error: null };
  }

  async getPaymentById(
    paymentId: string
  ): Promise<{ payment: Payment | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      return { payment: null, error };
    }

    return { payment: data as Payment, error: null };
  }

  async createPayment(
    payment: Partial<Payment>
  ): Promise<{ payment: Payment | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) {
      return { payment: null, error };
    }

    return { payment: data as Payment, error: null };
  }

  async updatePayment(
    paymentId: string,
    updates: Partial<Payment>
  ): Promise<{ payment: Payment | null; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      return { payment: null, error };
    }

    return { payment: data as Payment, error: null };
  }

  async cancelPayment(paymentId: string): Promise<{ error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { error } = await client
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('id', paymentId);

    return { error };
  }

  async getPendingPayments(
    userId: string
  ): Promise<{ payments: Payment[]; count: number; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error, count } = await client
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .order('scheduled_date', { ascending: true });

    if (error) {
      return { payments: [], count: 0, error };
    }

    return { payments: data as Payment[], count: count || 0, error: null };
  }

  async getPaymentsByStatus(
    userId: string,
    status: Payment['status']
  ): Promise<{ payments: Payment[]; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      return { payments: [], error };
    }

    return { payments: data as Payment[], error: null };
  }

  async processPayment(
    paymentId: string
  ): Promise<{ result: any; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client.rpc('process_payment', {
      payment_id_param: paymentId,
    });

    if (error) {
      return { result: null, error };
    }

    return { result: data, error: null };
  }

  async processScheduledPayments(): Promise<{ result: any; error: any }> {
    const client = this.supabaseService.getSupabaseClient();

    const { data, error } = await client.rpc('process_scheduled_payments');

    if (error) {
      return { result: null, error };
    }

    return { result: data, error: null };
  }
}
