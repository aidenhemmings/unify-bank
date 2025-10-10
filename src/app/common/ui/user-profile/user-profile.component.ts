import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  UbUserService,
  UbSupabaseService,
  UbLoadingService,
  UbToastService,
} from '@common/services';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UbButtonComponent, UbInputTextComponent } from '@common/ui';
import { formatDate } from '@angular/common';
import { User } from '@common/types';
import { UbGetFormControlPipe } from '@common/pipes';
import { LoadingKeys } from '@common/enums';

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

  form = new FormGroup({
    id: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

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
    this.loadingService.show(LoadingKeys.GLOBAL);
    const result = await this.supabaseService.updateUser(this.form);

    if (result.success && result.data) {
      this.userService.setCurrentUser(result.data);
      this.toastService.info('Success', 'Profile updated successfully');
    } else {
      this.toastService.error('Error', 'Failed to update profile');
    }
    this.isEditing = false;
  }
}
