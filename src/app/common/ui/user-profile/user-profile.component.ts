import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UbUserService, UbSupabaseService } from '@common/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { UbButtonComponent } from '../button/button.component';
import { formatDate } from '@angular/common';
import { User } from '@common/types';

@UntilDestroy({ checkProperties: true })
@Component({
    selector: 'ub-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [CommonModule, UbButtonComponent],
})
export class UbUserProfileComponent {
    private userService = inject(UbUserService);
    private supabaseService = inject(UbSupabaseService);
    private router = inject(Router);

    user: SupabaseUser | null = null;
    profile: User | null = null;

    constructor() {
        this.userService.currentUser.pipe(untilDestroyed(this)).subscribe((u) => {
            this.user = u;
        });

        this.userService.currentProfile.pipe(untilDestroyed(this)).subscribe((p) => {
            this.profile = p;
        });
    }

    get displayName(): string {
        if (this.profile) return `${this.profile.FirstName} ${this.profile.LastName}`.trim();
        const meta = this.user?.user_metadata as any;
        if (meta && meta['full_name']) return meta['full_name'];
        return this.user?.email ?? 'Unknown User';
    }

    get initials(): string {
        const name = this.displayName;
        const parts = name.split(' ').filter(Boolean);
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    memberSince(): string {
        const dateStr = this.profile?.CreatedAt ?? this.user?.created_at ?? null;
        if (!dateStr) return '—';
        try {
            return formatDate(new Date(dateStr), 'MMM d, y', 'en-US');
        } catch (e) {
            return dateStr;
        }
    }

    async logout(): Promise<void> {
        const { error } = await this.supabaseService.signOut();
        if (!error) {
            this.userService.clearUser();
            this.router.navigate(['/auth/login']);
        }
    }

    editProfile(): void {
        // Navigate to a profile edit route if it exists. If not, this can be hooked up later.
        this.router.navigate(['/profile/edit']);
    }
}