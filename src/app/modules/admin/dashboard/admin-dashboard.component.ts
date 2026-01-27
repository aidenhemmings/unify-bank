import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  UbAdminAuthService,
  UbAdminUsersService,
  UbLoadingService,
  UbToastService,
} from '@common/services';
import { AdminDashboardStats, AdminUser } from '@common/types';
import { UbButtonComponent, UbLoaderComponent } from '@common/ui';
import { LoadingKeys } from '@common/enums';

@Component({
  selector: 'ub-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [CommonModule, UbButtonComponent, UbLoaderComponent, RouterLink],
})
export class UbAdminDashboardComponent implements OnInit {
  private adminAuthService = inject(UbAdminAuthService);
  private adminUsersService = inject(UbAdminUsersService);
  private loadingService = inject(UbLoadingService);
  private router = inject(Router);
  private toastService = inject(UbToastService);

  admin: AdminUser | null = null;
  stats: AdminDashboardStats | null = null;
  currentDate = new Date();
  loaderKey = LoadingKeys.DASHBOARD;

  get loading(): boolean {
    const state = this.loadingService.getLoaderStateValue(this.loaderKey);
    return state.show;
  }

  ngOnInit(): void {
    this.admin = this.adminAuthService.getCurrentAdmin();
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    try {
      this.stats = await this.adminUsersService.getDashboardStats();
    } catch (error) {
      this.toastService.error('Error', 'Failed to load dashboard stats:');
    }

    this.loadingService.hide(this.loaderKey);
  }

  async logout(): Promise<void> {
    await this.adminAuthService.logout();
    await this.router.navigate(['/admin/login']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToInvitations(): void {
    this.router.navigate(['/admin/invitations']);
  }
}
