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
import { UbSupabaseService, UbUserService } from '@common/services';
import { CustomValidators } from '@common/validators';
import { Router } from '@angular/router';

@Component({
  selector: 'ub-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    UbGetFormControlPipe,
    UbInputTextComponent,
    UbButtonComponent,
  ],
})
export class UbAuthComponent {
  private supabaseService = inject(UbSupabaseService);
  private router = inject(Router);
  private userService = inject(UbUserService);

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
    const { user, token, error } = await this.supabaseService.signIn(
      username,
      password
    );

    if (error) {
      this.loginError = error.message;
      this.isLoading = false;
    } else if (user && token) {
      this.loginError = '';
      this.userService.setToken(token);
      await this.supabaseService.setToken(token);
      await this.router.navigate(['dashboard']);
      await this.userService.setCurrentUser(user);
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }
}
