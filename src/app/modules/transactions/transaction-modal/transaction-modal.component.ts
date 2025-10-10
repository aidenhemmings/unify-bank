import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  UbInputTextComponent,
  UbInputNumberComponent,
  UbSelectComponent,
} from '@common/ui';
import { UbGetFormControlPipe } from '@common/pipes';
import { Transaction, Account } from '@common/types';
import { AppComponent } from '../../../app.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UbModalFormService } from '@common/services';
import { TransactionCategoryOption, TransactionTypeOption } from './types';

@Component({
  selector: 'ub-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UbInputTextComponent,
    UbInputNumberComponent,
    UbSelectComponent,
    UbGetFormControlPipe,
  ],
})
export class UbTransactionModalComponent implements OnInit {
  private config = inject(DynamicDialogConfig);
  private modalFormService = inject(UbModalFormService);
  private fb = inject(FormBuilder);

  transaction!: Transaction;
  accounts: Account[] = [];
  isEditMode = false;
  isViewMode = false;

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  transactionForm!: FormGroup;

  transactionTypes: TransactionTypeOption[] = [
    {
      label: 'Credit (Income)',
      value: 'credit',
      icon: 'fa-arrow-trend-up',
      description: 'Money coming in',
    },
    {
      label: 'Debit (Expense)',
      value: 'debit',
      icon: 'fa-arrow-trend-down',
      description: 'Money going out',
    },
  ];

  categories: TransactionCategoryOption[] = [
    { label: 'Shopping', value: 'shopping', icon: 'fa-cart-shopping' },
    { label: 'Income', value: 'income', icon: 'fa-money-bill-trend-up' },
    { label: 'Entertainment', value: 'entertainment', icon: 'fa-tv' },
    { label: 'Utilities', value: 'utilities', icon: 'fa-bolt' },
    { label: 'Transfer', value: 'transfer', icon: 'fa-arrow-right-arrow-left' },
    { label: 'Business', value: 'business', icon: 'fa-briefcase' },
    { label: 'Payment', value: 'payment', icon: 'fa-paper-plane' },
  ];

  statuses = [
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  ngOnInit(): void {
    this.transaction = this.config.data?.transaction || {};
    this.accounts = this.config.data?.accounts || [];
    this.isEditMode = this.config.data?.isEditMode || false;
    this.isViewMode = this.config.data?.isViewMode || false;

    this.initializeForm();
  }

  initializeForm(): void {
    this.transactionForm = this.fb.group({
      accountId: [this.transaction?.account_id || '', [Validators.required]],
      description: [
        this.transaction?.description || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(500),
        ],
      ],
      amount: [
        this.transaction?.amount || 0,
        [Validators.required, Validators.min(0.01)],
      ],
      type: [this.transaction?.type || 'debit', [Validators.required]],
      category: [this.transaction?.category || '', [Validators.required]],
      status: [this.transaction?.status || 'completed', [Validators.required]],
      referenceNumber: [
        this.transaction?.reference_number || '',
        [Validators.maxLength(50)],
      ],
    });

    if (this.isViewMode) {
      this.transactionForm.disable();
    }

    if (this.isEditMode) {
      this.transactionForm.get('accountId')?.disable();
      this.transactionForm.get('type')?.disable();
    }

    this.modalFormService.setForm(this.transactionForm);
  }

  get accountOptions(): { label: string; value: string }[] {
    return this.accounts
      .filter((acc) => acc.is_active)
      .map((acc) => ({
        label: `${acc.name} (${this.formatCurrency(acc.balance || 0)})`,
        value: acc.id,
      }));
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.transactionForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    }
    if (field.errors['maxlength']) {
      return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    }
    if (field.errors['min']) {
      return `Minimum value is ${this.currencyConfig.symbol}${field.errors['min'].min}`;
    }

    return 'Invalid field';
  }

  getTransactionTypeLabel(): string {
    const type = this.transactionForm.get('type')?.value;
    return type === 'credit' ? 'Credit (Income)' : 'Debit (Expense)';
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find((c) => c.value === category);
    return cat?.icon || 'fa-circle-dollar';
  }
}
