import { Component, inject, Input, OnInit } from '@angular/core';
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
import { Account } from '@common/types';
import { AppComponent } from '../../../app.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UbModalFormService } from '@common/services';

interface AccountTypeOption {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'ub-account-modal',
  templateUrl: './account-modal.component.html',
  styleUrls: ['./account-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UbInputTextComponent,
    UbInputNumberComponent,
    UbSelectComponent,
    UbGetFormControlPipe,
  ],
})
export class UbAccountModalComponent implements OnInit {
  private config = inject(DynamicDialogConfig);
  private modalFormService = inject(UbModalFormService);

  account!: Account;
  isEditMode = false;

  readonly currencyConfig = AppComponent.CURRENCY_CONFIG;

  accountForm!: FormGroup;

  accountTypes: AccountTypeOption[] = [
    {
      label: 'Checking Account',
      value: 'Checking',
      icon: 'fa-building-columns',
    },
    { label: 'Savings Account', value: 'Savings', icon: 'fa-piggy-bank' },
    { label: 'Business Account', value: 'Business', icon: 'fa-briefcase' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.account = this.config.data?.account || {};
    this.isEditMode = this.config.data?.isEditMode || false;

    this.initializeForm();
  }

  initializeForm(): void {
    this.accountForm = this.fb.group({
      name: [
        this.account?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      type: [this.account?.type || '', [Validators.required]],
      balance: [
        this.account?.balance || 0,
        [Validators.required, Validators.min(0)],
      ],
      accountNumber: [
        this.account?.account_number || this.generateAccountNumber(),
        [Validators.required, Validators.pattern(/^[0-9]{10,20}$/)],
      ],
      currency: [
        this.account?.currency || this.currencyConfig.code,
        [Validators.required],
      ],
    });

    if (this.isEditMode) {
      this.accountForm.get('type')?.disable();
      this.accountForm.get('balance')?.disable();
    }

    this.modalFormService.setForm(this.accountForm);
  }

  generateAccountNumber(): string {
    return Math.floor(
      Math.random() * 9000000000000000 + 1000000000000000
    ).toString();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.accountForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.accountForm.get(fieldName);

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
      return `Minimum value is ${field.errors['min'].min}`;
    }
    if (field.errors['pattern']) {
      return 'Invalid format';
    }

    return 'Invalid field';
  }
}
