import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UbAccountsService,
  UbLoadingService,
  UbRealtimeService,
  UbToastService,
  UbUserService,
} from '@common/services';
import { Account, User } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  UbButtonComponent,
  UbLoaderComponent,
  UbModalFooterComponent,
} from '@common/ui';
import { AppComponent } from '../../app.component';
import { LoadingKeys, ModalResponseTypes } from '@common/enums';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UbAccountModalComponent } from './account-modal';
import { UbAccountViewModalComponent } from './account-view-modal';
import { ModalResponse } from '@common/types/modal-response.type';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  imports: [CommonModule, UbButtonComponent, UbLoaderComponent],
  providers: [DialogService],
})
export class UbAccountsComponent implements OnDestroy {
  private userService = inject(UbUserService);
  private accountsService = inject(UbAccountsService);
  private loadingService = inject(UbLoadingService);
  private realtimeService = inject(UbRealtimeService);
  private dialogService = inject(DialogService);
  private toastService = inject(UbToastService);

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  ref!: DynamicDialogRef | null;

  user!: User;
  accounts: Account[] = [];
  totalBalance = 0;

  loaderKey = LoadingKeys.ACCOUNTS;

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
          this.loadAccountsAndSetupRealtime();
        }
      });
  }

  ngOnDestroy(): void {
    this.realtimeService.unsubscribeAll();
  }

  /**
   * Loads accounts then sets up real-time subscriptions
   */
  private async loadAccountsAndSetupRealtime(): Promise<void> {
    await this.loadAccounts();
    this.setupRealtimeSubscriptions();
  }

  /**
   * Sets up real-time subscriptions for account changes
   */
  private setupRealtimeSubscriptions(): void {
    // Connect to Socket.io server with user info
    const accountIds = this.accounts.map((a) => a.id);
    this.realtimeService.connect(this.user.id, accountIds);

    this.realtimeService
      .subscribeToUserAccounts()
      .pipe(untilDestroyed(this))
      .subscribe((payload) => {
        console.log('Account change detected:', payload);
        if (payload.eventType === 'UPDATE') {
          // Update the specific account in place for real-time updates
          const updatedAccount = payload.new as Account;
          const index = this.accounts.findIndex(
            (a) => a.id === updatedAccount.id,
          );
          if (index !== -1) {
            this.accounts[index] = {
              ...this.accounts[index],
              ...updatedAccount,
            };
            this.calculateTotalBalance();
          }
        } else {
          // For inserts and deletes, reload the full list
          this.loadAccounts();
        }
      });
  }

  /**
   * Asynchronously loads all accounts for the current user from the supabase service.
   * Calculates total balance and displays error toast message if the request fails.
   */
  async loadAccounts(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    const { accounts, error } = await this.accountsService.getAccounts(
      this.user.id,
    );

    if (error) {
      this.toastService.error('Error', 'Failed to load accounts.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    this.accounts = accounts;
    this.calculateTotalBalance();
    this.loadingService.hide(this.loaderKey);
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.accounts
      .filter((acc) => acc.is_active)
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);
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
    }).format(new Date(date));
  }

  getAccountIcon(type: string): string {
    const icons: { [key: string]: string } = {
      Checking: 'fa-building-columns',
      Savings: 'fa-piggy-bank',
      Business: 'fa-briefcase',
    };
    return icons[type] || 'fa-building-columns';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  /**
   * Opens the account creation modal dialog.
   * Subscribes to the modal close event and handles account creation if confirmed.
   */
  onAddAccount(): void {
    this.ref = this.dialogService.open(UbAccountModalComponent, {
      data: {},
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
            this.handleAccountCreation(response.form);
          }
        }
      });
  }

  /**
   * Handles the creation of a new account by sending the form data to the supabase service.
   * Reloads accounts on success and displays appropriate toast messages.
   * @param form - The form group containing the account creation data.
   */
  async handleAccountCreation(form: any): Promise<void> {
    const payload = form.value;

    this.loadingService.show(this.loaderKey);

    const { account, error } = await this.accountsService.createAccount({
      user_id: this.user.id,
      name: payload.name,
      type: payload.type,
      account_number: payload.accountNumber,
      balance: payload.balance,
      currency: payload.currency,
      is_active: true,
    });

    if (error) {
      this.toastService.error('Error', 'Failed to create account.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    this.toastService.success('Success', 'Account created successfully.');
    await this.loadAccounts();
  }

  onViewDetails(account: Account): void {
    this.ref = this.dialogService.open(UbAccountViewModalComponent, {
      data: {
        account: account,
      },
      modal: true,
      width: '60vw',
      closable: true,
      baseZIndex: 6000,
      breakpoints: {
        '1700px': '70vw',
        '1400px': '85vw',
        '960px': '95vw',
      },
    });
  }

  onEditAccount(account: Account): void {
    this.ref = this.dialogService.open(UbAccountModalComponent, {
      data: {
        account: account,
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
            this.handleAccountEdit(response.form, account.id);
          }
        }
      });
  }

  /**
   * Handles the update of an existing account by sending the form data to the service.
   * Reloads accounts on success and displays appropriate toast messages.
   * @param form - The form group containing the updated account data.
   * @param id - The unique identifier of the account to update.
   */
  async handleAccountEdit(form: any, id: string): Promise<void> {
    const payload = form.value;

    this.loadingService.show(this.loaderKey);

    const { account, error } = await this.accountsService.updateAccount(id, {
      name: payload.name,
    });

    if (error) {
      this.toastService.error('Error', 'Failed to update account.');
      this.loadingService.hide(this.loaderKey);
      return;
    }

    this.toastService.info('Success', 'Account updated successfully.');
    await this.loadAccounts();
  }

  /**
   * Toggles the active status of an account.
   * @param account - The account object whose status is to be toggled.
   * @returns A promise that resolves when the operation is complete.
   */
  async onToggleStatus(account: Account): Promise<void> {
    const { error } = await this.accountsService.updateAccount(account.id, {
      is_active: !account.is_active,
    });

    if (error) {
      this.toastService.error('Error', 'Failed to update account status.');
      return;
    }

    await this.loadAccounts();
  }
}
