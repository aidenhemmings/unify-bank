import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UbUserService, UbSupabaseService } from '@common/services';
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
  private router = inject(Router);
  private supabaseService = inject(UbSupabaseService);
  private datePipe = inject(DatePipe);

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

  get displayName(): string {
    if (this.profile)
      return `${this.profile.first_name} ${this.profile.last_name}`.trim();
    const meta = (
      this.profile as unknown as {
        user_metadata?: SupabaseUser['user_metadata'];
      }
    )?.user_metadata;
    if (meta && typeof meta['full_name'] === 'string') return meta['full_name'];
    return 'Unknown User';
  }

  get initials(): string {
    const name = this.displayName;
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  memberStartDate(): string {
    const dateStr = this.profile?.created_at ?? null;
    if (!dateStr) return '—';
    return formatDate(new Date(dateStr), 'MMM d, y', 'en-US') ?? dateStr;
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
    // TODO: Add Loader
    const updated = await this.supabaseService.updateUser(this.form);

    if (updated) {
      // PLACEHOLDER FOR TOAST MESSAGE
      console.log('Profile updated successfully');
    } else {
      // PLACEHOLDER FOR TOAST MESSAGE
      console.error('Failed to update profile');
    }
    this.isEditing = false;
  }

  memberSince(): string {
    return this.profile.created_at;
  }
}
