import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: any = {};

      if (password.length < 8) {
        errors.minLength = 'Password must be at least 8 characters';
      }

      if (!/[A-Z]/.test(password)) {
        errors.uppercase =
          'Password must contain at least one uppercase letter';
      }

      if (!/[a-z]/.test(password)) {
        errors.lowercase =
          'Password must contain at least one lowercase letter';
      }

      if (!/\d/.test(password)) {
        errors.number = 'Password must contain at least one number';
      }

      if (!/[@$!%*?&]/.test(password)) {
        errors.special =
          'Password must contain at least one special character (@$!%*?&)';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static username(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const username = control.value;
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

      if (!usernameRegex.test(username)) {
        return {
          username:
            'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
        };
      }

      return null;
    };
  }

  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const email = control.value;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(email)) {
        return { email: 'Invalid email format' };
      }

      return null;
    };
  }

  static accountNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const accountNumber = control.value;
      const accountNumberRegex = /^[0-9]{8,16}$/;

      if (!accountNumberRegex.test(accountNumber)) {
        return {
          accountNumber: 'Account number must be 8-16 digits',
        };
      }

      return null;
    };
  }

  static amount(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const amount = control.value;
      const amountRegex = /^\d+(\.\d{1,2})?$/;

      if (!amountRegex.test(amount.toString())) {
        return {
          amount: 'Invalid amount format (use up to 2 decimal places)',
        };
      }

      if (parseFloat(amount) <= 0) {
        return { amount: 'Amount must be greater than 0' };
      }

      return null;
    };
  }

  static noSpecialChars(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value;
      const specialChars = /[<>]/;

      if (specialChars.test(value)) {
        return { specialChars: 'Special characters < and > are not allowed' };
      }

      return null;
    };
  }

  static sanitizeInput(value: string): string {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/[<>]/g, '').substring(0, 1000);
  }
}
