import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UbBreadcrumbService, UbUserService } from '@common/services';
import { Breadcrumb, User } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-header-bar',
  imports: [CommonModule, RouterLink],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss',
})
export class UbHeaderBarComponent implements OnInit {
  private breadcrumbService = inject(UbBreadcrumbService);
  private userService = inject(UbUserService);

  breadcrumbs: Breadcrumb[] = [];
  currentUser: User | null = null;
  showProfileMenu = false;

  ngOnInit() {
    this.breadcrumbService.breadcrumbs$
      .pipe(untilDestroyed(this))
      .subscribe((breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
      });

    this.userService.currentUser
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';

    const firstName = this.currentUser.first_name || '';
    const lastName = this.currentUser.last_name || '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout(): void {
    this.closeProfileMenu();
    this.userService.clearSession();
    window.location.href = '/auth/login';
  }

  closeProfileMenu() {
    this.showProfileMenu = false;
  }
}
