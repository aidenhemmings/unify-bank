import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  UbSupabaseService,
  UbUserService,
  UbSidebarService,
  UbLoadingService,
  UbToastService,
} from '@common/services';
import {
  UbSidebarComponent,
  UbHeaderBarComponent,
  UbLoaderComponent,
} from '@common/ui';
import { CommonModule } from '@angular/common';
import { User } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LoadingKeys } from '@common/enums';
import { APP_CURRENCY_CONFIG } from './app.config.currency';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    UbSidebarComponent,
    UbHeaderBarComponent,
    CommonModule,
    UbLoaderComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ConfirmationService],
})
export class AppComponent implements OnInit {
  private userService = inject(UbUserService);
  private supabaseService = inject(UbSupabaseService);
  private sidebarService = inject(UbSidebarService);
  private loadingService = inject(UbLoadingService);
  private toastService = inject(UbToastService);

  static readonly CURRENCY_CONFIG = APP_CURRENCY_CONFIG;

  loaderKey = LoadingKeys.GLOBAL;

  currentUser: User | null = null;
  isCollapsed = false;

  get loading(): boolean {
    const state = this.loadingService.getLoaderStateValue(this.loaderKey);
    return state.show;
  }

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
    this.loadingService.show(this.loaderKey, true);

    const token = this.userService.getToken();

    if (token) {
      const { userId, error } = await this.supabaseService.validateToken(token);

      if (userId && !error) {
        const { user } = await this.supabaseService.getUserById(userId);

        if (user) {
          await this.userService.setCurrentUser(user);
          this.loadingService.hide(this.loaderKey);
          return;
        } else {
          this.userService.clearSession();
          this.loadingService.hide(this.loaderKey);
          return;
        }
      } else {
        this.userService.clearSession();
        this.loadingService.hide(this.loaderKey);
        return;
      }
    }

    this.loadingService.hide(this.loaderKey);
  }

  get mainContentMargin(): string {
    if (!this.currentUser) return '0px';
    return this.isCollapsed ? '70px' : '280px';
  }
}
