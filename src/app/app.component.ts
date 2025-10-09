import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  UbSupabaseService,
  UbUserService,
  UbSidebarService,
} from '@common/services';
import { UbSidebarComponent, UbHeaderBarComponent } from '@common/ui';
import { CommonModule } from '@angular/common';
import { User } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    UbSidebarComponent,
    UbHeaderBarComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private userService = inject(UbUserService);
  private supabaseService = inject(UbSupabaseService);
  private sidebarService = inject(UbSidebarService);

  currentUser: User | null = null;
  isCollapsed = false;

  ngOnInit() {
    this.userService.currentUser
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
      });

    this.sidebarService.isCollapsed$
      .pipe(untilDestroyed(this))
      .subscribe((collapsed) => {
        this.isCollapsed = collapsed;
      });

    this.validateSession();
  }

  async validateSession() {
    const token = this.userService.getToken();

    if (token) {
      const { userId, error } = await this.supabaseService.validateToken(token);

      if (userId && !error) {
        const { user } = await this.supabaseService.getUserById(userId);

        if (user) {
          this.userService.setCurrentUser(user);
        } else {
          this.userService.clearSession();
        }
      } else {
        this.userService.clearSession();
      }
    }
  }

  get mainContentMargin(): string {
    if (!this.currentUser) return '0px';
    return this.isCollapsed ? '70px' : '280px';
  }
}
