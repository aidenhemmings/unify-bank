import { Component, inject } from '@angular/core';
import { UbSupabaseService, UbUserService } from '@common/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UbUserProfileComponent } from '@common/ui';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, UbUserProfileComponent],
})
export class UbDashboardComponent {
  private userService = inject(UbUserService);
  private supabaseService = inject(UbSupabaseService);
  private router = inject(Router);

  user!: SupabaseUser;

  constructor() {
    this.userService.currentUser
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        if (user) {
          this.user = user;
        }
      });
  }

  async logout(): Promise<void> {
    const { error } = await this.supabaseService.signOut();
    if (!error) {
      this.userService.clearUser();
      this.router.navigate(['/auth/login']);
    }
  }
}
