import { Component, inject } from '@angular/core';
import {
  UbAccountsService,
  UbLoadingService,
  UbPaymentsService,
  UbSupabaseService,
  UbTransactionsService,
  UbUserService,
} from '@common/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Account, QuickAction, Transaction, User } from '@common/types';
import { UbButtonComponent, UbLoaderComponent } from '@common/ui';
import { AppComponent } from '../../app.component';
import { LoadingKeys } from '@common/enums';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, UbButtonComponent, UbLoaderComponent],
})
export class UbDashboardComponent {
  private userService = inject(UbUserService);
  private loadingService = inject(UbLoadingService);
  private supabaseService = inject(UbSupabaseService);
  private accountsService = inject(UbAccountsService);
  private transactionsService = inject(UbTransactionsService);
  private paymentsService = inject(UbPaymentsService);
  private router = inject(Router);

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  user!: User;
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  quickActions: QuickAction[] = [];
  totalBalance = 0;
  currentDate = new Date();
  monthlyIncome = 0;
  monthlyExpenses = 0;
  pendingPaymentsCount = 0;

  loaderKey = LoadingKeys.DASHBOARD;

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
          this.loadDashboardData();
        }
      });
  }

  private async loadDashboardData(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    try {
      await Promise.all([
        this.loadAccounts(),
        this.loadRecentTransactions(),
        this.loadMonthlyStats(),
        this.loadPendingPayments(),
      ]);

      this.setupQuickActions();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loadingService.hide(this.loaderKey);
    }
  }

  private async loadAccounts(): Promise<void> {
    const { accounts, error } = await this.accountsService.getAccounts(
      this.user.id
    );

    if (error) {
      console.error('Error loading accounts:', error);
      return;
    }

    this.accounts = accounts;
    this.totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );
  }

  private async loadRecentTransactions(): Promise<void> {
    const { transactions, error } =
      await this.transactionsService.getAllTransactionsForUser(this.user.id, 5);

    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }

    this.recentTransactions = transactions;
  }

  private async loadMonthlyStats(): Promise<void> {
    const now = new Date();
    const { income, expenses, error } =
      await this.transactionsService.getMonthlyStats(
        this.user.id,
        now.getFullYear(),
        now.getMonth() + 1
      );

    if (error) {
      console.error('Error loading monthly stats:', error);
      return;
    }

    this.monthlyIncome = income;
    this.monthlyExpenses = expenses;
  }

  private async loadPendingPayments(): Promise<void> {
    const { count, error } = await this.paymentsService.getPendingPayments(
      this.user.id
    );

    if (error) {
      console.error('Error loading pending payments:', error);
      return;
    }

    this.pendingPaymentsCount = count;
  }

  private setupQuickActions(): void {
    this.quickActions = [
      {
        icon: 'fa-paper-plane',
        label: 'Send Payment',
        route: '/payments',
        color: 'primary',
      },
      {
        icon: 'fa-building-columns',
        label: 'View Accounts',
        route: '/accounts',
        color: 'success',
      },
      {
        icon: 'fa-clock-rotate-left',
        label: 'Transactions',
        route: '/transactions',
        color: 'info',
      },
      {
        icon: 'fa-file-invoice-dollar',
        label: 'Pay Bills',
        route: '/payments',
        color: 'warning',
      },
    ];
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

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
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
    return icons[category] || 'fa-circle';
  }

  async logout(): Promise<void> {
    const token = this.userService.getToken();

    if (token) {
      await this.supabaseService.invalidateToken(token);
    }

    this.userService.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
