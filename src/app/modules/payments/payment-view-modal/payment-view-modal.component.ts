import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payment, Account } from '@common/types';
import { AppComponent } from '../../../app.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'ub-payment-view-modal',
  templateUrl: './payment-view-modal.component.html',
  styleUrls: ['./payment-view-modal.component.scss'],
  imports: [CommonModule],
})
export class UbPaymentViewModalComponent implements OnInit {
  private config = inject(DynamicDialogConfig);

  payment!: Payment;
  accounts: Account[] = [];

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  ngOnInit(): void {
    this.payment = this.config.data?.payment || {};
    this.accounts = this.config.data?.accounts || [];
  }

  formatCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat(this.currencyConfig.locale, {
      style: 'currency',
      currency: this.currencyConfig.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formatted
      .replace(this.currencyConfig.code, this.currencyConfig.symbol)
      .trim();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'status-pending',
      processing: 'status-processing',
      completed: 'status-completed',
      failed: 'status-failed',
      cancelled: 'status-cancelled',
    };
    return classes[status] || 'status-pending';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getPaymentTypeIcon(type: string): string {
    return type === 'recurring' ? 'fa-rotate' : 'fa-paper-plane';
  }

  getPaymentTypeText(type: string): string {
    return type === 'recurring' ? 'Recurring Payment' : 'One-Time Payment';
  }

  getFrequencyText(frequency?: string): string {
    if (!frequency) return 'N/A';
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  }

  getAccountName(accountId: string): string {
    const account = this.accounts.find((a) => a.id === accountId);
    return account?.name || 'Unknown Account';
  }

  getAccountNumber(accountId: string): string {
    const account = this.accounts.find((a) => a.id === accountId);
    return account?.account_number || 'N/A';
  }
}
