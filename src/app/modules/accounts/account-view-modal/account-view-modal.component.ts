import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account, Transaction } from '@common/types';
import { AppComponent } from '../../../app.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import {
  UbTransactionsService,
  UbLoadingService,
  UbToastService,
} from '@common/services';
import { UbLoaderComponent } from '@common/ui';
import { LoadingKeys } from '@common/enums';

@Component({
  selector: 'ub-account-view-modal',
  templateUrl: './account-view-modal.component.html',
  styleUrls: ['./account-view-modal.component.scss'],
  imports: [CommonModule, UbLoaderComponent],
})
export class UbAccountViewModalComponent implements OnInit {
  private config = inject(DynamicDialogConfig);
  private transactionsService = inject(UbTransactionsService);
  private loadingService = inject(UbLoadingService);
  private toastService = inject(UbToastService);

  account!: Account;
  transactions: Transaction[] = [];

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  loaderKey = LoadingKeys.TRANSACTIONS;

  get loading(): boolean {
    const state = this.loadingService.getLoaderStateValue(this.loaderKey);
    return state.show;
  }

  ngOnInit(): void {
    this.account = this.config.data?.account || {};

    if (this.account?.id) {
      this.loadTransactions();
    }
  }

  async loadTransactions(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    const { transactions, error } =
      await this.transactionsService.getTransactions(this.account.id);

    if (error) {
      this.toastService.error('Error', 'Failed to load transactions.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    this.transactions = transactions;
    this.loadingService.hide(this.loaderKey);
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

  formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  getTransactionIcon(category: string): string {
    const icons: { [key: string]: string } = {
      Shopping: 'fa-cart-shopping',
      shopping: 'fa-cart-shopping',
      Income: 'fa-money-bill-trend-up',
      income: 'fa-money-bill-trend-up',
      Entertainment: 'fa-tv',
      entertainment: 'fa-tv',
      Utilities: 'fa-bolt',
      utilities: 'fa-bolt',
      Transfer: 'fa-arrow-right-arrow-left',
      transfer: 'fa-arrow-right-arrow-left',
      Business: 'fa-briefcase',
      business: 'fa-briefcase',
      Payment: 'fa-paper-plane',
      payment: 'fa-paper-plane',
    };
    return icons[category] || 'fa-circle-dollar';
  }

  getAccountIcon(type: string): string {
    const icons: { [key: string]: string } = {
      Checking: 'fa-building-columns',
      Savings: 'fa-piggy-bank',
      Business: 'fa-briefcase',
    };
    return icons[type] || 'fa-building-columns';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      completed: 'status-completed',
      pending: 'status-pending',
      failed: 'status-failed',
      cancelled: 'status-cancelled',
    };
    return classes[status] || 'status-pending';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  get totalIncome(): number {
    return this.transactions
      .filter((t) => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
