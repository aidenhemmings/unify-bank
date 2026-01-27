import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UbGetFormControlPipe } from '@common/pipes';
import { UbButtonComponent, UbInputTextComponent } from '@common/ui';
import { UbAdminAuthService } from '@common/services';
import { CustomValidators } from '@common/validators';
import { Router } from '@angular/router';

@Component({
  selector: 'ub-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    UbGetFormControlPipe,
    UbInputTextComponent,
    UbButtonComponent,
  ],
})
export class UbAdminLoginComponent {
  private adminAuthService = inject(UbAdminAuthService);
  private router = inject(Router);

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      CustomValidators.username(),
      CustomValidators.noSpecialChars(),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  loginError = '';
  isLoading = false;
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles the admin login process by validating form input and authenticating.
   * Sets authentication token, navigates to admin dashboard on success, and displays error messages on failure.
   */
  async login(): Promise<void> {
    if (
      this.form.invalid ||
      !this.form.value.username ||
      !this.form.value.password
    ) {
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const { username, password } = this.form.value;
    const { success, error } = await this.adminAuthService.login(
      username,
      password,
    );

    if (error) {
      this.loginError = error;
      this.isLoading = false;
    } else if (success) {
      this.loginError = '';
      await this.router.navigate(['/admin/dashboard']);
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }
}
