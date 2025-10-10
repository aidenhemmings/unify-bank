import { Component, inject } from '@angular/core';
import {
  UbAccountsService,
  UbLoadingService,
  UbPaymentsService,
  UbSupabaseService,
  UbToastService,
  UbTransactionsService,
  UbUserService,
} from '@common/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Account, QuickAction, Transaction, User } from '@common/types';
import {
  UbButtonComponent,
  UbLoaderComponent,
  UbModalFooterComponent,
} from '@common/ui';
import { AppComponent } from '../../app.component';
import { LoadingKeys, ModalResponseTypes } from '@common/enums';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UbPaymentModalComponent } from '../payments/payment-modal';
import { ModalResponse } from '@common/types/modal-response.type';
import { TooltipModule } from 'primeng/tooltip';
import { UbTransactionModalComponent } from '../transactions';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, UbButtonComponent, UbLoaderComponent, TooltipModule],
  providers: [DialogService],
})
export class UbDashboardComponent {
  private userService = inject(UbUserService);
  private loadingService = inject(UbLoadingService);
  private supabaseService = inject(UbSupabaseService);
  private accountsService = inject(UbAccountsService);
  private transactionsService = inject(UbTransactionsService);
  private paymentsService = inject(UbPaymentsService);
  private router = inject(Router);
  private toastService = inject(UbToastService);
  private dialogService = inject(DialogService);

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  ref: DynamicDialogRef | undefined;

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

  async loadDashboardData(): Promise<void> {
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
      this.toastService.error('Error', 'Failed to load dashboard data.');
    } finally {
      this.loadingService.hide(this.loaderKey);
    }
  }

  private async loadAccounts(): Promise<void> {
    const { accounts, error } = await this.accountsService.getAccounts(
      this.user.id
    );

    if (error) {
      this.toastService.error('Error', 'Failed to load accounts.');
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
      this.toastService.error('Error', 'Failed to load transactions.');
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
      this.toastService.error('Error', 'Failed to load monthly stats.');
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
      this.toastService.error('Error', 'Failed to load pending payments.');
      return;
    }

    this.pendingPaymentsCount = count;
  }

  private setupQuickActions(): void {
    this.quickActions = [
      {
        icon: 'fa-paper-plane',
        label: 'Send Payment',
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

  handleQuickAction(action: QuickAction): void {
    if (action.label === 'Send Payment') {
      this.onAddPayment();
    } else if (action.label === 'Pay Bills') {
      this.onAddTransaction();
    } else {
      this.router.navigate([action.route]);
    }
  }

  onAddPayment(): void {
    this.ref = this.dialogService.open(UbPaymentModalComponent, {
      data: {
        accounts: this.accounts,
      },
      modal: true,
      width: '50vw',
      closable: true,
      baseZIndex: 6000,
      breakpoints: {
        '1700px': '65vw',
        '1400px': '80vw',
        '960px': '90vw',
      },
      templates: {
        footer: UbModalFooterComponent,
      },
    });

    this.ref.onClose
      .pipe(untilDestroyed(this))
      .subscribe((response: ModalResponse) => {
        if (response) {
          if (response.type === ModalResponseTypes.CONFIRM) {
            this.handlePaymentCreation(response.form);
          }
        }
      });
  }

  async handlePaymentCreation(form: any): Promise<void> {
    const payload = form.getRawValue();

    this.loadingService.show(this.loaderKey);

    const isScheduled = !!payload.scheduledDate;

    const { payment, error } = await this.paymentsService.createPayment({
      user_id: this.user.id,
      from_account_id: payload.fromAccountId,
      recipient_name: payload.recipientName,
      to_account_number: payload.toAccountNumber,
      amount: payload.amount,
      currency: this.currencyConfig.code,
      payment_type: payload.paymentType,
      frequency: payload.frequency || undefined,
      scheduled_date: payload.scheduledDate || undefined,
      description: payload.description || undefined,
      status: isScheduled ? 'pending' : 'processing',
    });

    if (error) {
      this.toastService.error('Error', 'Failed to create payment.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    this.toastService.success('Success', 'Payment created successfully!');

    if (!isScheduled && payment) {
      const { result, error: processError } =
        await this.paymentsService.processPayment(payment.id);

      if (processError) {
        this.toastService.error('Error', 'Payment processing failed.');
      } else {
        if (!result.success) {
          this.toastService.error('Error', `Payment failed.`);
        } else {
          this.toastService.success(
            'Success',
            'Payment completed successfully!'
          );
        }
      }
    } else {
      this.toastService.success('Success', 'Payment scheduled successfully!');
    }

    await this.loadDashboardData();
    this.loadingService.hide(this.loaderKey);
  }

  onAddTransaction(): void {
    this.ref = this.dialogService.open(UbTransactionModalComponent, {
      data: {
        accounts: this.accounts,
      },
      modal: true,
      width: '50vw',
      closable: true,
      baseZIndex: 6000,
      breakpoints: {
        '1700px': '65vw',
        '1400px': '80vw',
        '960px': '90vw',
      },
      templates: {
        footer: UbModalFooterComponent,
      },
    });

    this.ref.onClose
      .pipe(untilDestroyed(this))
      .subscribe((response: ModalResponse) => {
        if (response) {
          if (response.type === ModalResponseTypes.CONFIRM) {
            this.handleTransactionCreation(response.form);
          }
        }
      });
  }

  async handleTransactionCreation(form: any): Promise<void> {
    const payload = form.getRawValue();

    this.loadingService.show(this.loaderKey);

    const { transaction, error } =
      await this.transactionsService.createTransaction({
        account_id: payload.accountId,
        description: payload.description,
        amount: payload.amount,
        type: payload.type,
        category: payload.category,
        status: payload.status,
        reference_number: payload.referenceNumber || undefined,
      });

    if (error) {
      this.toastService.error('Error', 'Failed to create transaction.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    if (payload.status === 'completed') {
      const { error: balanceError } =
        await this.accountsService.updateAccountBalance(
          payload.accountId,
          payload.amount,
          payload.type
        );

      if (balanceError) {
        this.toastService.error(
          'Warning',
          'Transaction created but failed to update account balance.'
        );
      }
    }

    this.toastService.success('Success', 'Transaction created successfully!');

    await this.loadDashboardData();
    this.loadingService.hide(this.loaderKey);
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

  getAccountName(accountId: string): string {
    const account = this.accounts.find((a) => a.id === accountId);
    return account?.name || 'Unknown Account';
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
