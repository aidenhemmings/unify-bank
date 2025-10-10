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
import { Payment, Account } from '@common/types';
import { AppComponent } from '../../../app.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UbModalFormService } from '@common/services';
import { FrequencyOption, PaymentTypeOption } from './types';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'ub-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UbInputTextComponent,
    UbInputNumberComponent,
    UbSelectComponent,
    UbGetFormControlPipe,
    DatePicker,
  ],
})
export class UbPaymentModalComponent implements OnInit {
  private config = inject(DynamicDialogConfig);
  private modalFormService = inject(UbModalFormService);
  private fb = inject(FormBuilder);

  payment!: Payment;
  accounts: Account[] = [];
  isEditMode = false;

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  paymentForm!: FormGroup;

  paymentTypes: PaymentTypeOption[] = [
    {
      label: 'One-Time Payment',
      value: 'one-time',
      icon: 'fa-paper-plane',
      description: 'Send a single payment',
    },
    {
      label: 'Recurring Payment',
      value: 'recurring',
      icon: 'fa-rotate',
      description: 'Set up automatic payments',
    },
  ];

  frequencies: FrequencyOption[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-weekly', value: 'bi-weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annually', value: 'annually' },
  ];

  ngOnInit(): void {
    this.payment = this.config.data?.payment || {};
    this.accounts = this.config.data?.accounts || [];
    this.isEditMode = this.config.data?.isEditMode || false;

    this.initializeForm();
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      fromAccountId: [
        this.payment?.from_account_id || '',
        [Validators.required],
      ],
      recipientName: [
        this.payment?.recipient_name || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      toAccountNumber: [
        this.payment?.to_account_number || '',
        [Validators.required, Validators.pattern(/^[0-9]{10,20}$/)],
      ],
      amount: [
        this.payment?.amount || 0,
        [Validators.required, Validators.min(0.01)],
      ],
      paymentType: [
        this.payment?.payment_type || 'one-time',
        [Validators.required],
      ],
      frequency: [this.payment?.frequency || ''],
      scheduledDate: [
        this.payment?.scheduled_date
          ? new Date(this.payment.scheduled_date)
          : null,
      ],
      description: [
        this.payment?.description || '',
        [Validators.maxLength(500)],
      ],
    });

    this.paymentForm.get('paymentType')?.valueChanges.subscribe((type) => {
      const frequencyControl = this.paymentForm.get('frequency');
      if (type === 'recurring') {
        frequencyControl?.setValidators([Validators.required]);
      } else {
        frequencyControl?.clearValidators();
        frequencyControl?.setValue('');
      }
      frequencyControl?.updateValueAndValidity();
    });

    if (this.isEditMode) {
      this.paymentForm.get('fromAccountId')?.disable();
      this.paymentForm.get('toAccountNumber')?.disable();
    }

    this.modalFormService.setForm(this.paymentForm);
  }

  get isRecurringPayment(): boolean {
    return this.paymentForm.get('paymentType')?.value === 'recurring';
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
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);

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
    if (field.errors['pattern']) {
      if (fieldName === 'toAccountNumber') {
        return 'Account number must be 10-20 digits';
      }
      return 'Invalid format';
    }

    return 'Invalid field';
  }

  getTodayDate(): Date {
    return new Date();
  }
}
