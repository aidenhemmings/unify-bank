import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UbBreadcrumbService, UbUserService } from '@common/services';
import { Breadcrumb, User } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UbButtonComponent } from '../button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UbUserSettingsModalComponent } from '../user-settings-modal/user-settings-modal.component';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-header-bar',
  imports: [CommonModule, RouterLink, UbButtonComponent],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss',
  providers: [DialogService],
})
export class UbHeaderBarComponent implements OnInit {
  private breadcrumbService = inject(UbBreadcrumbService);
  private userService = inject(UbUserService);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  breadcrumbs: Breadcrumb[] = [];
  currentUser: User | null = null;
  showProfileMenu = false;

  ref!: DynamicDialogRef | null;

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

  openSettings(): void {
    this.closeProfileMenu();
    this.ref = this.dialogService.open(UbUserSettingsModalComponent, {
      modal: true,
      width: '60vw',
      closable: true,
      baseZIndex: 6000,
      breakpoints: {
        '1700px': '70vw',
        '1400px': '85vw',
        '960px': '95vw',
      },
    });
  }

  async logout(): Promise<void> {
    this.closeProfileMenu();
    await this.userService.clearSession();
    this.router.navigate(['auth', 'login']);
  }

  closeProfileMenu() {
    this.showProfileMenu = false;
  }
}
