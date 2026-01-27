import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UbGetFormControlPipe } from '@common/pipes';
import { UbButtonComponent, UbInputTextComponent } from '@common/ui';
import { UbAdminUsersService } from '@common/services';
import { CustomValidators } from '@common/validators';

@Component({
  selector: 'ub-accept-invite',
  templateUrl: './accept-invite.component.html',
  styleUrls: ['./accept-invite.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    UbGetFormControlPipe,
    UbInputTextComponent,
    UbButtonComponent,
    RouterLink,
  ],
})
export class UbAcceptInviteComponent implements OnInit {
  private adminUsersService = inject(UbAdminUsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  email = '';
  isValidating = true;
  isValid = false;
  isSubmitting = false;
  isComplete = false;
  error = '';
  showPassword = false;

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
    confirmPassword: new FormControl('', [Validators.required]),
    first_name: new FormControl(''),
    last_name: new FormControl(''),
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      this.token = params['token'] || '';
      if (this.token) {
        await this.validateToken();
      } else {
        this.isValidating = false;
        this.error = 'No invitation token provided';
      }
    });
  }

  async validateToken(): Promise<void> {
    try {
      const response = await this.adminUsersService.validateInvitation(
        this.token,
      );
      this.isValid = response.valid;
      this.email = response.email || '';
      if (!response.valid) {
        this.error = response.error || 'Invalid invitation';
      }
    } catch (error: any) {
      this.isValid = false;
      this.error = error.error?.error || 'Failed to validate invitation';
    }
    this.isValidating = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    try {
      await this.adminUsersService.acceptInvitation(this.token, {
        username: this.form.value.username || '',
        password: this.form.value.password || '',
        first_name: this.form.value.first_name || undefined,
        last_name: this.form.value.last_name || undefined,
      });

      this.isComplete = true;
    } catch (error: any) {
      this.error = error.error?.error || 'Failed to create account';
    }

    this.isSubmitting = false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
