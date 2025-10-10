import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UbTransactionsService,
  UbUserService,
  UbAccountsService,
  UbLoadingService,
} from '@common/services';
import { Transaction, User, Account } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UbButtonComponent, UbLoaderComponent } from '@common/ui';
import { AppComponent } from '../../app.component';
import { LoadingKeys } from '@common/enums';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  imports: [CommonModule, UbButtonComponent, UbLoaderComponent],
})
export class UbTransactionsComponent {
  private userService = inject(UbUserService);
  private transactionsService = inject(UbTransactionsService);
  private accountsService = inject(UbAccountsService);
  private loadingService = inject(UbLoadingService);

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  user!: User;
  transactions: Transaction[] = [];
  accounts: Account[] = [];
  selectedFilter: 'all' | 'credit' | 'debit' = 'all';
  selectedCategory: string = 'all';

  loaderKey = LoadingKeys.TRANSACTIONS;

  categories = [
    'All',
    'Shopping',
    'Income',
    'Entertainment',
    'Utilities',
    'Transfer',
    'Business',
  ];

  get loading(): boolean {
    const state = this.loadingService.getLoaderStateValue(this.loaderKey);
    return state.show;
  }

  constructor() {
    this.userService.currentUser
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        if (user) {
          this.user = user;
          this.loadData();
        }
      });
  }

  async loadData(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    await Promise.all([this.loadTransactions(), this.loadAccounts()]);

    this.loadingService.hide(this.loaderKey);
  }

  async loadTransactions(): Promise<void> {
    const { transactions, error } =
      await this.transactionsService.getAllTransactionsForUser(this.user.id);

    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }

    this.transactions = transactions;
  }

  async loadAccounts(): Promise<void> {
    const { accounts, error } = await this.accountsService.getAccounts(
      this.user.id
    );

    if (error) {
      console.error('Error loading accounts:', error);
      return;
    }

    this.accounts = accounts;
  }

  get filteredTransactions(): Transaction[] {
    let filtered = [...this.transactions];

    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === this.selectedFilter);
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === this.selectedCategory);
    }

    return filtered;
  }

  get totalIncome(): number {
    return this.transactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
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

  formatDate(date: string | Date): string {
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
      Income: 'fa-money-bill-trend-up',
      Entertainment: 'fa-tv',
      Utilities: 'fa-bolt',
      Transfer: 'fa-arrow-right-arrow-left',
      Business: 'fa-briefcase',
    };
    return icons[category] || 'fa-circle-dollar';
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

  getAccountName(accountId: string): string {
    const account = this.accounts.find((a) => a.id === accountId);
    return account?.name || 'Unknown Account';
  }

  setFilter(filter: 'all' | 'credit' | 'debit'): void {
    this.selectedFilter = filter;
  }

  setCategory(category: string): void {
    this.selectedCategory = category.toLowerCase();
  }

  onAddTransaction(): void {
    console.log('Add transaction clicked - Modal will be implemented');
  }

  onViewDetails(transaction: Transaction): void {
    console.log('View transaction details:', transaction);
  }

  onExportTransactions(): void {
    console.log('Export transactions clicked');
  }
}
