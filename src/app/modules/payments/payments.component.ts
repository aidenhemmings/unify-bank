import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UbPaymentsService,
  UbUserService,
  UbAccountsService,
  UbLoadingService,
  UbToastService,
  UbRealtimeService,
} from '@common/services';
import { Payment, User, Account } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  UbButtonComponent,
  UbLoaderComponent,
  UbModalFooterComponent,
} from '@common/ui';
import { AppComponent } from '../../app.component';
import { LoadingKeys, ModalResponseTypes } from '@common/enums';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UbPaymentModalComponent } from './payment-modal';
import { UbPaymentViewModalComponent } from './payment-view-modal';
import { ModalResponse } from '@common/types/modal-response.type';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  imports: [CommonModule, UbButtonComponent, UbLoaderComponent],
  providers: [DialogService],
})
export class UbPaymentsComponent implements OnDestroy {
  private userService = inject(UbUserService);
  private paymentsService = inject(UbPaymentsService);
  private accountsService = inject(UbAccountsService);
  private loadingService = inject(UbLoadingService);
  private realtimeService = inject(UbRealtimeService);
  private dialogService = inject(DialogService);
  private toastService = inject(UbToastService);

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  ref!: DynamicDialogRef | null;

  user!: User;
  payments: Payment[] = [];
  accounts: Account[] = [];
  selectedFilter: 'all' | 'pending' | 'completed' | 'failed' | 'cancelled' =
    'all';
  selectedType: 'all' | 'one-time' | 'recurring' = 'all';

  loaderKey = LoadingKeys.PAYMENTS;

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
          this.loadDataAndSetupRealtime();
        }
      });
  }

  ngOnDestroy(): void {
    this.realtimeService.unsubscribeAll();
  }

  /**
   * Loads data then sets up real-time subscriptions
   */
  private async loadDataAndSetupRealtime(): Promise<void> {
    await this.loadData();
    this.setupRealtimeSubscriptions();
  }

  /**
   * Sets up real-time subscriptions for payment changes
   */
  private setupRealtimeSubscriptions(): void {
    // Connect to Socket.io server with user info
    const accountIds = this.accounts.map((a) => a.id);
    this.realtimeService.connect(this.user.id, accountIds);

    // Subscribe to outgoing payments (payments created by user)
    this.realtimeService
      .subscribeToOutgoingPayments()
      .pipe(untilDestroyed(this))
      .subscribe((payload) => {
        console.log('Payment change detected:', payload);
        const payment = payload.new as Payment;

        if (payload.eventType === 'INSERT') {
          this.payments = [payment, ...this.payments];
        } else if (payload.eventType === 'UPDATE') {
          const index = this.payments.findIndex((p) => p.id === payment.id);
          if (index !== -1) {
            this.payments[index] = { ...this.payments[index], ...payment };

            // Show notifications for status changes
            if (payment.status === 'declined') {
              this.toastService.warn(
                'Payment Declined',
                `Your payment to ${payment.recipient_name} was declined.`,
              );
            } else if (payment.status === 'completed') {
              this.toastService.success(
                'Payment Completed',
                `Your payment to ${payment.recipient_name} was approved!`,
              );
            }
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedPayment = payload.old as Payment;
          this.payments = this.payments.filter(
            (p) => p.id !== deletedPayment.id,
          );
        }
      });
  }

  /**
   * Asynchronously loads payments and accounts for the current user.
   */
  async loadData(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    await Promise.all([this.loadPayments(), this.loadAccounts()]);

    this.loadingService.hide(this.loaderKey);
  }

  /**
   * Loads all payments for the current user from the supabase service.
   * @returns A promise that resolves when payments are loaded.
   */
  async loadPayments(): Promise<void> {
    const { payments, error } = await this.paymentsService.getPayments(
      this.user.id,
    );

    if (error) {
      this.toastService.error('Error', 'Failed to load payments.');
      return;
    }

    this.payments = payments;
  }

  /**
   * Loads all accounts for the current user from the supabase service.
   * @returns A promise that resolves when accounts are loaded.
   */
  async loadAccounts(): Promise<void> {
    const { accounts, error } = await this.accountsService.getAccounts(
      this.user.id,
    );

    if (error) {
      this.toastService.error('Error', 'Failed to load accounts.');
      return;
    }

    this.accounts = accounts;
  }

  get filteredPayments(): Payment[] {
    let filtered = [...this.payments];

    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === this.selectedFilter);
    }

    if (this.selectedType !== 'all') {
      filtered = filtered.filter((p) => p.payment_type === this.selectedType);
    }

    return filtered;
  }

  get pendingPayments(): Payment[] {
    return this.payments.filter((p) => p.status === 'pending');
  }

  get completedPayments(): Payment[] {
    return this.payments.filter((p) => p.status === 'completed');
  }

  get totalPendingAmount(): number {
    return this.pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  get totalCompletedAmount(): number {
    return this.completedPayments.reduce((sum, p) => sum + p.amount, 0);
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

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  getAccountName(accountId: string): string {
    const account = this.accounts.find((a) => a.id === accountId);
    return account?.name || 'Unknown Account';
  }

  getPaymentTypeIcon(type: string): string {
    return type === 'recurring' ? 'fa-rotate' : 'fa-paper-plane';
  }

  getFrequencyText(frequency?: string): string {
    if (!frequency) return '';
    return `Repeats ${frequency}`;
  }

  setStatusFilter(
    filter: 'all' | 'pending' | 'completed' | 'failed' | 'cancelled',
  ): void {
    this.selectedFilter = filter;
  }

  setTypeFilter(type: 'all' | 'one-time' | 'recurring'): void {
    this.selectedType = type;
  }

  /**
   * Opens the payment creation modal dialog.
   * Handles the response from the modal and initiates payment creation if confirmed.
   */
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

  /**
   * Asynchronously handles the creation of a new payment based on form data.
   * @param form - The form group containing the payment creation data.
   * @returns A promise that resolves when the payment creation is complete.
   */
  async handlePaymentCreation(form: any): Promise<void> {
    const payload = form.getRawValue();

    this.loadingService.show(this.loaderKey);

    const isScheduled = !!payload.scheduledDate;

    const response = await this.paymentsService.createPayment({
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

    if (response.error) {
      this.toastService.error('Error', 'Failed to create payment.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    const payment = response.payment;
    const requiresApproval = response.requires_approval;

    // If the payment requires approval from the recipient, don't process it immediately
    if (requiresApproval) {
      this.toastService.success(
        'Payment Sent',
        'Your payment is pending approval from the recipient.',
      );
      await this.loadData();
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
            'Payment completed successfully!',
          );
        }
      }
    }

    await this.loadData();
    this.loadingService.hide(this.loaderKey);
  }

  onViewDetails(payment: Payment): void {
    this.ref = this.dialogService.open(UbPaymentViewModalComponent, {
      data: {
        payment: payment,
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
    });
  }

  /**
   * Cancels a pending payment.
   * @param payment - The payment to be cancelled.
   * @returns A promise that resolves when the cancellation is complete.
   */
  async onCancelPayment(payment: Payment): Promise<void> {
    if (payment.status !== 'pending') {
      return;
    }

    const { error } = await this.paymentsService.cancelPayment(payment.id);

    if (error) {
      this.toastService.error('Error', 'Failed to cancel payment.');
      return;
    }

    await this.loadPayments();
  }
}
