import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UbAdminAuthService,
  UbAdminUsersService,
  UbLoadingService,
  UbToastService,
} from '@common/services';
import { AdminUser, ModalResponse, UserRole } from '@common/types';
import {
  UbButtonComponent,
  UbLoaderComponent,
  UbInputTextComponent,
  UbSelectComponent,
  UbModalFooterComponent,
} from '@common/ui';
import { LoadingKeys, ModalResponseTypes } from '@common/enums';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UbAdminUserEditModalComponent } from './admin-user-edit-modal/admin-user-edit-modal.component';
import { TooltipModule } from 'primeng/tooltip';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService } from 'primeng/api';

interface FilterOption {
  label: string;
  value: string;
}

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    UbButtonComponent,
    UbLoaderComponent,
    UbInputTextComponent,
    UbSelectComponent,
    TooltipModule,
  ],
  providers: [DialogService],
})
export class UbAdminUsersComponent implements OnInit {
  private adminUsersService = inject(UbAdminUsersService);
  private adminAuthService = inject(UbAdminAuthService);
  private loadingService = inject(UbLoadingService);
  private toastService = inject(UbToastService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  ref: DynamicDialogRef | undefined;

  users: AdminUser[] = [];
  allUsers: AdminUser[] = [];
  totalUsers = 0;
  searchTerm = '';
  roleFilter: UserRole | '' = '';
  activeFilter: 'all' | 'active' | 'inactive' = 'all';
  loaderKey = LoadingKeys.USERS;

  roleOptions: FilterOption[] = [
    { label: 'All Roles', value: '' },
    { label: 'Users', value: 'user' },
    { label: 'Admins', value: 'admin' },
  ];

  statusOptions: FilterOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  get loading(): boolean {
    const state = this.loadingService.getLoaderStateValue(this.loaderKey);
    return state.show;
  }

  get currentAdminId(): string {
    return this.adminAuthService.getCurrentAdmin()?.id || '';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['filter'] === 'inactive') {
        this.activeFilter = 'inactive';
      }
      this.loadUsers();
    });
  }

  async loadUsers(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    try {
      const response = await this.adminUsersService.getUsers();
      this.allUsers = response.users;
      this.applyFilters();
    } catch (error) {
      this.toastService.error('Error', 'Failed to load users');
    }

    this.loadingService.hide(this.loaderKey);
  }

  applyFilters(): void {
    let filtered = [...this.allUsers];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.first_name.toLowerCase().includes(term) ||
          user.last_name.toLowerCase().includes(term),
      );
    }

    if (this.roleFilter) {
      filtered = filtered.filter((user) => user.role === this.roleFilter);
    }

    if (this.activeFilter !== 'all') {
      const isActive = this.activeFilter === 'active';
      filtered = filtered.filter((user) => user.is_active === isActive);
    }

    this.users = filtered;
    this.totalUsers = filtered.length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openEditModal(user: AdminUser): void {
    this.ref = this.dialogService.open(UbAdminUserEditModalComponent, {
      data: {
        user,
      },
      modal: true,
      width: '40vw',
      closable: true,
      baseZIndex: 6000,
      breakpoints: {
        '1700px': '55vw',
        '1400px': '70vw',
        '960px': '90vw',
      },
      templates: {
        footer: UbModalFooterComponent,
      },
    });

    this.ref.onClose
      .pipe(untilDestroyed(this))
      .subscribe((response: ModalResponse) => {
        if (response) {
          if (response.type === ModalResponseTypes.CONFIRM) {
            this.handleEditUser(user.id, response.form!.value);
          }
        }
      });
  }

  async handleEditUser(userId: string, form: any): Promise<void> {
    this.loadingService.show(this.loaderKey);

    try {
      await this.adminUsersService.updateUser(userId, {
        first_name: form.first_name || '',
        last_name: form.last_name || '',
        role: form.role || 'user',
      });

      this.toastService.success('Success', 'User updated successfully');
    } catch (error) {
      this.toastService.error('Error', 'Failed to update user');
    } finally {
      this.loadingService.hide(this.loaderKey);
      this.loadUsers();
    }
  }

  async toggleUserStatus(user: AdminUser): Promise<void> {
    if (user.id === this.currentAdminId) {
      this.toastService.error('Error', 'Cannot modify your own account status');
      return;
    }

    try {
      if (user.is_active) {
        await this.adminUsersService.deactivateUser(user.id);
        this.toastService.success(
          'Success',
          `User ${user.username} has been deactivated`,
        );
      } else {
        await this.adminUsersService.reactivateUser(user.id);
        this.toastService.success(
          'Success',
          `User ${user.username} has been reactivated`,
        );
      }
      this.loadUsers();
    } catch (error) {
      this.toastService.error('Error', 'Failed to update user status');
    }
  }

  async deleteUser(user: AdminUser): Promise<void> {
    if (user.id === this.currentAdminId) {
      this.toastService.error('Error', 'Cannot delete your own account');
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.username}'s account? This action cannot be undone.`,
      header: 'Confirm Deletion',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'info',
        size: 'small',
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
        size: 'small',
      },
      accept: async () => {
        try {
          await this.adminUsersService.deleteUser(user.id);
          this.toastService.success(
            'Success',
            `User ${user.username} has been deleted`,
          );
          this.loadUsers();
        } catch (error) {
          this.toastService.error('Error', 'Failed to delete user');
        }
      },
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      default:
        return 'badge-user';
    }
  }

  formatRole(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  }

  navigateToInvitations(): void {
    this.router.navigate(['/admin/invitations']);
  }
}
