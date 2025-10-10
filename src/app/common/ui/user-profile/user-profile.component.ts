import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UbUserService, UbSupabaseService } from '@common/services';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { UbButtonComponent } from '@common/ui';
import { formatDate } from '@angular/common';
import { User as AppUser } from '@common/types';

@UntilDestroy({ checkProperties: true })
@Component({
    selector: 'ub-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [CommonModule, UbButtonComponent],
})
export class UbUserProfileComponent {
    private userService = inject(UbUserService);
    private router = inject(Router);

    // The profile can be null briefly during app startup or sign-out.
    // Auth guards should prevent unauthenticated access, but observables
    // often emit `null` while session state is resolving — keep the type
    // nullable so the component handles that safely.
    profile: AppUser | null = null;
    isEditing = false;

    // reactive form for editing profile
    form = new FormGroup({
        first_name: new FormControl(''),
        last_name: new FormControl(''),
        username: new FormControl(''),
        email: new FormControl(''),
    });
    private supabaseService = inject(UbSupabaseService);
    private supabase = this.supabaseService.getSupabaseClient();

    constructor() {
        this.userService.currentUser.pipe(untilDestroyed(this)).subscribe((user: AppUser | null) => {
            this.profile = user;
            if (user) {
                this.form.patchValue({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    email: user.email,
                });
            }
        });
    }

    get displayName(): string {
        if (this.profile) return `${this.profile.first_name} ${this.profile.last_name}`.trim();
    // fallback to metadata.full_name if present. the app `User` type doesn't include
    // Supabase user_metadata, so we check for it safely via a narrow shape.
        const meta = (this.profile as unknown as { user_metadata?: SupabaseUser['user_metadata'] })?.user_metadata;
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
        return formatDate(new Date(dateStr), 'MMM d, y', 'en-US') ?? dateStr
    }

    logout(): void {
        // Clear local session and navigate to login. Supabase sign-out is handled server-side/token invalidation.
        this.userService.clearSession();
        this.router.navigate(['/auth/login']);
    }

    startEditing(): void {
        if (!this.profile) return;
        this.isEditing = true;
        this.form.patchValue({
            first_name: this.profile.first_name,
            last_name: this.profile.last_name,
            username: this.profile.username,
            email: this.profile.email,
        });
    }

    cancelEditing(): void {
        this.isEditing = false;
        if (this.profile) {
            this.form.patchValue({
                first_name: this.profile.first_name,
                last_name: this.profile.last_name,
                username: this.profile.username,
                email: this.profile.email,
            });
        }
    }

    async saveProfile(): Promise<void> {
        if (!this.profile) return;
        const updates = this.form.value as Partial<AppUser>;
        // persist to 'users' table using supabase client
        const { data, error } = await this.supabase
            .from('users')
            .update({
                first_name: updates.first_name,
                last_name: updates.last_name,
                username: updates.username,
                email: updates.email,
            })
            .eq('id', this.profile.id)
            .select()
            .single();

        if (!error && data) {
            // update local service state
            this.userService.setCurrentUser(data as AppUser);
            this.isEditing = false;
        } else {
            // TODO: surface error to the user (toast/snackbar)
            console.error('Failed to update profile', error);
        }
    }
}