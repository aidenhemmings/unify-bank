import { Component, inject } from '@angular/core';
import { UbSupabaseService, UbUserService } from '@common/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '@common/types';
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

  user!: User;

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
    const token = this.userService.getToken();

    if (token) {
      await this.supabaseService.invalidateToken(token);
    }

    this.userService.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
