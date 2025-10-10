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
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  loginError = '';

  async login(): Promise<void> {
    if (
      this.form.invalid ||
      !this.form.value.username ||
      !this.form.value.password
    ) {
      return;
    }

    const { username, password } = this.form.value;
    const { user, token, error } = await this.supabaseService.signIn(
      username,
      password
    );

    if (error) {
      this.loginError = error.message;
    } else if (user && token) {
      this.loginError = '';
      this.userService.setToken(token);
      this.userService.setCurrentUser(user);
      this.router.navigate(['dashboard']);
    }
  }
}
