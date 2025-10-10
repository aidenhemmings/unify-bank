import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UbTransactionsService,
  UbUserService,
  UbAccountsService,
  UbLoadingService,
  UbToastService,
  UbModalFormService,
} from '@common/services';
import { Transaction, User, Account, ModalResponse } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  UbButtonComponent,
  UbLoaderComponent,
  UbModalFooterComponent,
} from '@common/ui';
import { AppComponent } from '../../app.component';
import { LoadingKeys, ModalResponseTypes } from '@common/enums';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UbTransactionModalComponent } from './transaction-modal/transaction-modal.component';
import { Popover } from 'primeng/popover';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UbGetFormControlPipe } from '@common/pipes';
import * as XLSX from 'xlsx';
import { DatePicker } from 'primeng/datepicker';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  imports: [
    CommonModule,
    UbButtonComponent,
    UbLoaderComponent,
    Popover,
    DatePicker,
    ReactiveFormsModule,
    UbGetFormControlPipe,
  ],
  providers: [DialogService],
})
export class UbTransactionsComponent {
  @ViewChild('exportPopover') exportPopover!: Popover;

  private userService = inject(UbUserService);
  private transactionsService = inject(UbTransactionsService);
  private accountsService = inject(UbAccountsService);
  private loadingService = inject(UbLoadingService);
  private toastService = inject(UbToastService);
  private dialogService = inject(DialogService);

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  ref!: DynamicDialogRef | null;

  user!: User;
  transactions: Transaction[] = [];
  accounts: Account[] = [];
  selectedFilter: 'all' | 'credit' | 'debit' = 'all';
  selectedCategory: string = 'all';

  exportForm = new FormGroup({
    fromDate: new FormControl(''),
    toDate: new FormControl(''),
  });

  loaderKey = LoadingKeys.TRANSACTIONS;

  categories = [
    'All',
    'Shopping',
    'Income',
    'Entertainment',
    'Utilities',
    'Transfer',
    'Business',
    'Payment',
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
      this.toastService.error('Error', 'Failed to load transactions.');
      return;
    }

    this.transactions = transactions;
  }

  async loadAccounts(): Promise<void> {
    const { accounts, error } = await this.accountsService.getAccounts(
      this.user.id
    );

    if (error) {
      this.toastService.error('Error', 'Failed to load accounts.');
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

    await this.loadData();
    this.loadingService.hide(this.loaderKey);
  }

  onViewDetails(transaction: Transaction): void {
    this.ref = this.dialogService.open(UbTransactionModalComponent, {
      data: {
        transaction: transaction,
        accounts: this.accounts,
        isViewMode: true,
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

  onEditTransaction(transaction: Transaction): void {
    this.ref = this.dialogService.open(UbTransactionModalComponent, {
      data: {
        transaction: transaction,
        accounts: this.accounts,
        isEditMode: true,
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
            this.handleTransactionUpdate(transaction.id, response.form);
          }
        }
      });
  }

  async handleTransactionUpdate(
    transactionId: string,
    form: any
  ): Promise<void> {
    const payload = form.getRawValue();

    this.loadingService.show(this.loaderKey);

    const originalTransaction = this.transactions.find(
      (t) => t.id === transactionId
    );

    if (!originalTransaction) {
      this.toastService.error('Error', 'Original transaction not found.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    const { transaction, error } =
      await this.transactionsService.updateTransaction(transactionId, {
        description: payload.description,
        amount: payload.amount,
        category: payload.category,
        status: payload.status,
        reference_number: payload.referenceNumber || undefined,
      });

    if (error) {
      this.toastService.error('Error', 'Failed to update transaction.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    const amountChanged = originalTransaction.amount !== payload.amount;
    const statusChanged = originalTransaction.status !== payload.status;

    if (amountChanged || statusChanged) {
      if (originalTransaction.status === 'completed') {
        const reverseType =
          originalTransaction.type === 'credit' ? 'debit' : 'credit';
        await this.accountsService.updateAccountBalance(
          originalTransaction.account_id,
          originalTransaction.amount,
          reverseType
        );
      }

      if (payload.status === 'completed') {
        const { error: balanceError } =
          await this.accountsService.updateAccountBalance(
            originalTransaction.account_id,
            payload.amount,
            originalTransaction.type
          );

        if (balanceError) {
          this.toastService.error(
            'Warning',
            'Transaction updated but failed to update account balance.'
          );
        }
      }
    }

    this.toastService.success('Success', 'Transaction updated successfully!');

    await this.loadData();
    this.loadingService.hide(this.loaderKey);
  }

  onExportTransactions(): void {
    const fromDate = this.exportForm.get('fromDate')?.value;
    const toDate = this.exportForm.get('toDate')?.value;

    if (!fromDate || !toDate) {
      this.toastService.error('Error', 'Please select both from and to dates.');
      return;
    }

    const fromDateTime = new Date(fromDate).getTime();
    const toDateTime = new Date(toDate).getTime();

    if (fromDateTime > toDateTime) {
      this.toastService.error('Error', 'From date must be before to date.');
      return;
    }

    const filteredTransactions = this.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at || '').getTime();
      return transactionDate >= fromDateTime && transactionDate <= toDateTime;
    });

    if (filteredTransactions.length === 0) {
      this.toastService.error(
        'No Data',
        'No transactions found in the selected date range.'
      );
      return;
    }

    const excelData = filteredTransactions.map((transaction) => ({
      Date: this.formatDate(transaction.created_at || ''),
      Account: this.getAccountName(transaction.account_id),
      Description: transaction.description,
      Category:
        transaction.category.charAt(0).toUpperCase() +
        transaction.category.slice(1),
      Type: transaction.type === 'credit' ? 'Income' : 'Expense',
      Amount: transaction.amount,
      Status: this.getStatusText(transaction.status || 'pending'),
      'Reference Number': transaction.reference_number || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const columnWidths = [
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
    ];
    worksheet['!cols'] = columnWidths;

    const fromDateStr = new Date(fromDate).toISOString().split('T')[0];
    const toDateStr = new Date(toDate).toISOString().split('T')[0];
    const filename = `Transactions_${fromDateStr}_to_${toDateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);

    this.toastService.success(
      'Success',
      `Exported ${filteredTransactions.length} transactions.`
    );

    this.exportPopover.hide();

    this.exportForm.reset();
  }

  onToggleExportPopover(event: Event): void {
    this.exportPopover.toggle(event);
  }
}
