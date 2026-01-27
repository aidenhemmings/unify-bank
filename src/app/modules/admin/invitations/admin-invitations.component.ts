import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UbAdminUsersService,
  UbLoadingService,
  UbToastService,
} from '@common/services';
import { UserInvitation } from '@common/types';
import {
  UbButtonComponent,
  UbLoaderComponent,
  UbInputTextComponent,
  UbSelectComponent,
} from '@common/ui';
import { LoadingKeys } from '@common/enums';
import { Clipboard } from '@angular/cdk/clipboard';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

interface StatusOption {
  label: string;
  value: string;
}

@Component({
  selector: 'ub-admin-invitations',
  templateUrl: './admin-invitations.component.html',
  styleUrls: ['./admin-invitations.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    UbButtonComponent,
    UbLoaderComponent,
    UbInputTextComponent,
    UbSelectComponent,
    TooltipModule,
  ],
})
export class UbAdminInvitationsComponent implements OnInit {
  private adminUsersService = inject(UbAdminUsersService);
  private loadingService = inject(UbLoadingService);
  private toastService = inject(UbToastService);
  private clipboard = inject(Clipboard);
  private confirmationService = inject(ConfirmationService);

  invitations: UserInvitation[] = [];
  allInvitations: UserInvitation[] = [];
  newEmail = '';
  statusFilter: '' | 'pending' | 'accepted' | 'expired' | 'cancelled' = '';
  loaderKey = LoadingKeys.INVITATIONS;
  isInviting = false;
  lastInviteLink = '';

  statusOptions: StatusOption[] = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Expired', value: 'expired' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  get loading(): boolean {
    const state = this.loadingService.getLoaderStateValue(this.loaderKey);
    return state.show;
  }

  ngOnInit(): void {
    this.loadInvitations();
  }

  async loadInvitations(): Promise<void> {
    this.loadingService.show(this.loaderKey);

    try {
      this.allInvitations = await this.adminUsersService.getInvitations();
      this.applyFilter();
    } catch (error) {
      this.toastService.error('Error', 'Failed to load invitations');
    }

    this.loadingService.hide(this.loaderKey);
  }

  applyFilter(): void {
    if (!this.statusFilter) {
      this.invitations = [...this.allInvitations];
    } else {
      this.invitations = this.allInvitations.filter(
        (inv) => inv.status === this.statusFilter,
      );
    }
  }

  async inviteUser(): Promise<void> {
    if (!this.newEmail || !this.isValidEmail(this.newEmail)) {
      this.toastService.error('Error', 'Please enter a valid email address');
      return;
    }

    this.isInviting = true;

    try {
      const response = await this.adminUsersService.inviteUser(this.newEmail);
      this.lastInviteLink = response.inviteLink;
      this.toastService.success('Success', 'Invitation sent successfully');
      this.newEmail = '';
      this.loadInvitations();
    } catch (error: any) {
      this.toastService.error(
        'Error',
        error.error?.error || 'Failed to send invitation',
      );
    }

    this.isInviting = false;
  }

  async cancelInvitation(invitation: UserInvitation): Promise<void> {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel the invitation for ${invitation.email}? This action cannot be undone.`,
      header: 'Confirm Cancellation',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'info',
        size: 'small',
      },
      acceptButtonProps: {
        label: 'Cancel Invitation',
        severity: 'danger',
        size: 'small',
      },
      accept: async () => {
        try {
          await this.adminUsersService.cancelInvitation(invitation.id);
          this.toastService.success('Success', 'Invitation cancelled');
          this.loadInvitations();
        } catch (error) {
          this.toastService.error('Error', 'Failed to cancel invitation');
        }
      },
    });
  }

  async resendInvitation(invitation: UserInvitation): Promise<void> {
    try {
      const response = await this.adminUsersService.resendInvitation(
        invitation.id,
      );
      this.lastInviteLink = response.inviteLink;
      this.toastService.success('Success', 'Invitation resent successfully');
      this.loadInvitations();
    } catch (error) {
      this.toastService.error('Error', 'Failed to resend invitation');
    }
  }

  copyInviteLink(): void {
    if (this.lastInviteLink) {
      this.clipboard.copy(this.lastInviteLink);
      this.toastService.success('Success', 'Invite link copied to clipboard');
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'accepted':
        return 'badge-accepted';
      case 'expired':
        return 'badge-expired';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return '';
    }
  }

  isExpired(invitation: UserInvitation): boolean {
    return new Date(invitation.expires_at) < new Date();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
