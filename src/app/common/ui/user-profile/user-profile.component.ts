import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  UbUserService,
  UbSupabaseService,
  UbLoadingService,
  UbToastService,
} from '@common/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UbButtonComponent, UbInputTextComponent } from '@common/ui';
import { User } from '@common/types';
import { UbGetFormControlPipe } from '@common/pipes';
import { LoadingKeys } from '@common/enums';
import { CustomValidators } from '@common/validators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  imports: [
    CommonModule,
    UbButtonComponent,
    UbGetFormControlPipe,
    ReactiveFormsModule,
    UbInputTextComponent,
  ],
  providers: [DatePipe],
})
export class UbUserProfileComponent {
  private userService = inject(UbUserService);
  private supabaseService = inject(UbSupabaseService);
  private loadingService = inject(UbLoadingService);
  private toastService = inject(UbToastService);

  profile!: User;
  isEditing = false;
  isChangingPassword = false;

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const newPassword = control.get('new_password')?.value;
    const confirmPassword = control.get('confirm_password')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      control.get('confirm_password')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  form = new FormGroup({
    id: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [
      Validators.required,
      CustomValidators.noSpecialChars(),
    ]),
    last_name: new FormControl('', [
      Validators.required,
      CustomValidators.noSpecialChars(),
    ]),
    username: new FormControl('', [
      Validators.required,
      CustomValidators.username(),
    ]),
    email: new FormControl('', [Validators.required, CustomValidators.email()]),
  });

  passwordForm = new FormGroup(
    {
      current_password: new FormControl('', [Validators.required]),
      new_password: new FormControl('', [
        Validators.required,
        CustomValidators.strongPassword(),
      ]),
      confirm_password: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator.bind(this) }
  );

  constructor() {
    this.userService.currentUser
      .pipe(untilDestroyed(this))
      .subscribe((user: User | null) => {
        this.profile = user!;
        this.form.patchValue({
          id: user!.id,
          first_name: user!.first_name,
          last_name: user!.last_name,
          username: user!.username,
          email: user!.email,
        });
      });
  }

  get memberSince(): string {
    return this.profile.created_at;
  }

  get displayName(): string {
    return `${this.profile.first_name} ${this.profile.last_name}`;
  }

  get initials(): string {
    return `${this.profile.first_name
      .charAt(0)
      .toUpperCase()}${this.profile.last_name.charAt(0).toUpperCase()}`;
  }

  startEditing(): void {
    if (!this.profile) return;
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.profile) {
      this.form.patchValue({
        id: this.profile.id,
        first_name: this.profile.first_name,
        last_name: this.profile.last_name,
        username: this.profile.username,
        email: this.profile.email,
      });
    }
  }

  async saveProfile(): Promise<void> {
    if (this.form.invalid) {
      this.toastService.error('Error', 'Please fix validation errors');
      return;
    }

    this.loadingService.show(LoadingKeys.USER_PROFILE);
    const result = await this.supabaseService.updateUser(this.form);

    if (result.success && result.data) {
      await this.userService.setCurrentUser(result.data);
      this.toastService.info('Success', 'Profile updated successfully');
      this.isEditing = false;
    } else {
      this.toastService.error('Error', 'Failed to update profile');
    }
    this.loadingService.hide(LoadingKeys.USER_PROFILE);
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.toastService.error('Error', 'Please fix validation errors');
      return;
    }

    this.loadingService.show(LoadingKeys.USER_PROFILE);

    const currentPassword = this.passwordForm.value.current_password!;
    const newPassword = this.passwordForm.value.new_password!;

    const result = await this.supabaseService.changePassword(
      currentPassword,
      newPassword
    );

    if (result.success) {
      this.toastService.info('Success', 'Password changed successfully');
      this.passwordForm.reset();
      this.isChangingPassword = false;
    } else {
      this.toastService.error(
        'Error',
        result.error?.message || 'Failed to change password'
      );
    }

    this.loadingService.hide(LoadingKeys.USER_PROFILE);
  }

  getPasswordErrors(controlName: string): string[] {
    const control = this.passwordForm.get(controlName);
    if (!control || !control.errors || !control.touched) return [];

    const errors: string[] = [];
    if (control.errors['required']) errors.push('This field is required');
    if (control.errors['minLength'])
      errors.push('Password must be at least 8 characters');
    if (control.errors['uppercase'])
      errors.push('Must contain at least one uppercase letter');
    if (control.errors['lowercase'])
      errors.push('Must contain at least one lowercase letter');
    if (control.errors['number'])
      errors.push('Must contain at least one number');
    if (control.errors['special'])
      errors.push('Must contain at least one special character (@$!%*?&)');
    if (control.errors['passwordMismatch'])
      errors.push('Passwords do not match');

    return errors;
  }
}
