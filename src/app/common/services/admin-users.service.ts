import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environment/environment';
import {
  AdminUser,
  AdminDashboardStats,
  UsersResponse,
  InvitationsResponse,
  UserInvitation,
  InviteUserResponse,
  ValidateInvitationResponse,
  AcceptInviteRequest,
} from '@common/types';
import { UbAdminAuthService } from './admin-auth.service';

interface SingleUserResponse {
  user: AdminUser;
}

interface MessageResponse {
  message: string;
}

interface StatsResponse {
  stats: AdminDashboardStats;
}

@Injectable({
  providedIn: 'root',
})
export class UbAdminUsersService {
  private http = inject(HttpClient);
  private adminAuthService = inject(UbAdminAuthService);

  private get headers(): HttpHeaders {
    const token = this.adminAuthService.getToken();
    return new HttpHeaders().set('X-Admin-Token', token || '');
  }

  /**
   * Retrieves dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await firstValueFrom(
      this.http.get<StatsResponse>(`${environment.apiUrl}/admin/users/stats`, {
        headers: this.headers,
      }),
    );
    return response.stats;
  }

  /**
   * Retrieves all users
   */
  async getUsers(): Promise<UsersResponse> {
    return await firstValueFrom(
      this.http.get<UsersResponse>(`${environment.apiUrl}/admin/users`, {
        headers: this.headers,
      }),
    );
  }

  /**
   * Retrieves a user by ID
   */
  async getUserById(id: string): Promise<AdminUser> {
    const response = await firstValueFrom(
      this.http.get<SingleUserResponse>(
        `${environment.apiUrl}/admin/users/${id}`,
        { headers: this.headers },
      ),
    );
    return response.user;
  }

  /**
   * Updates a user
   */
  async updateUser(
    id: string,
    data: Partial<
      Pick<AdminUser, 'first_name' | 'last_name' | 'role' | 'is_active'>
    >,
  ): Promise<AdminUser> {
    const response = await firstValueFrom(
      this.http.put<SingleUserResponse>(
        `${environment.apiUrl}/admin/users/${id}`,
        data,
        { headers: this.headers },
      ),
    );
    return response.user;
  }

  /**
   * Deactivates a user
   */
  async deactivateUser(id: string): Promise<void> {
    await firstValueFrom(
      this.http.post<MessageResponse>(
        `${environment.apiUrl}/admin/users/${id}/deactivate`,
        {},
        { headers: this.headers },
      ),
    );
  }

  /**
   * Reactivates a user
   */
  async reactivateUser(id: string): Promise<AdminUser> {
    const response = await firstValueFrom(
      this.http.post<SingleUserResponse & MessageResponse>(
        `${environment.apiUrl}/admin/users/${id}/reactivate`,
        {},
        { headers: this.headers },
      ),
    );
    return response.user;
  }

  /**
   * Permanently deletes a user (super admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<MessageResponse>(
        `${environment.apiUrl}/admin/users/${id}`,
        { headers: this.headers },
      ),
    );
  }

  // Invitation methods

  /**
   * Creates a new user invitation
   */
  async inviteUser(email: string): Promise<InviteUserResponse> {
    return await firstValueFrom(
      this.http.post<InviteUserResponse>(
        `${environment.apiUrl}/admin/users/invitations`,
        { email },
        { headers: this.headers },
      ),
    );
  }

  /**
   * Retrieves all invitations
   */
  async getInvitations(): Promise<UserInvitation[]> {
    const response = await firstValueFrom(
      this.http.get<InvitationsResponse>(
        `${environment.apiUrl}/admin/users/invitations`,
        { headers: this.headers },
      ),
    );
    return response.invitations;
  }

  /**
   * Cancels an invitation
   */
  async cancelInvitation(id: string): Promise<void> {
    await firstValueFrom(
      this.http.post<MessageResponse>(
        `${environment.apiUrl}/admin/users/invitations/${id}/cancel`,
        {},
        { headers: this.headers },
      ),
    );
  }

  /**
   * Resends an invitation
   */
  async resendInvitation(id: string): Promise<InviteUserResponse> {
    return await firstValueFrom(
      this.http.post<InviteUserResponse>(
        `${environment.apiUrl}/admin/users/invitations/${id}/resend`,
        {},
        { headers: this.headers },
      ),
    );
  }

  /**
   * Validates an invitation token (public - no auth required)
   */
  async validateInvitation(token: string): Promise<ValidateInvitationResponse> {
    return await firstValueFrom(
      this.http.get<ValidateInvitationResponse>(
        `${environment.apiUrl}/admin/users/invitations/validate/${token}`,
      ),
    );
  }

  /**
   * Accepts an invitation and creates an account (public - no auth required)
   */
  async acceptInvitation(
    token: string,
    data: AcceptInviteRequest,
  ): Promise<{ user: AdminUser; message: string }> {
    return await firstValueFrom(
      this.http.post<{ user: AdminUser; message: string }>(
        `${environment.apiUrl}/admin/users/invitations/accept/${token}`,
        data,
      ),
    );
  }
}
