import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environment/environment';
import { AdminUser, UserRole } from '@common/types';
import { UbLoadingService } from './loading.service';
import { LoadingKeys } from '@common/enums';

interface AdminLoginResponse {
  message: string;
  token: string;
  admin: AdminUser;
}

interface AdminValidateResponse {
  valid: boolean;
  admin: AdminUser;
}

@Injectable({
  providedIn: 'root',
})
export class UbAdminAuthService {
  private http = inject(HttpClient);
  private loadingService = inject(UbLoadingService);

  private adminSubject = new BehaviorSubject<AdminUser | null>(null);
  private readonly ADMIN_TOKEN_KEY = 'admin_token';

  get currentAdmin(): Observable<AdminUser | null> {
    return this.adminSubject.asObservable();
  }

  /**
   * Retrieves current admin value
   * @returns An AdminUser object or null
   */
  getCurrentAdmin(): AdminUser | null {
    return this.adminSubject.value;
  }

  /**
   * Sets the current admin
   * @param admin - The AdminUser object to set
   */
  setCurrentAdmin(admin: AdminUser | null): void {
    this.adminSubject.next(admin);
  }

  /**
   * Sets the admin authentication token
   * @param token - The authentication token to set
   */
  setToken(token: string): void {
    localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
  }

  /**
   * Retrieves the admin authentication token
   * @returns A string token or null
   */
  getToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Clears the admin token from storage
   */
  clearToken(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Checks if user is an admin
   */
  isAdmin(): boolean {
    return this.adminSubject.value?.role === 'admin';
  }

  /**
   * Attempts to log in as admin
   * @param username - The admin username
   * @param password - The admin password
   */
  async login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    this.loadingService.show(LoadingKeys.GLOBAL, true);

    try {
      const response = await firstValueFrom(
        this.http.post<AdminLoginResponse>(
          `${environment.apiUrl}/admin/auth/login`,
          {
            username,
            password,
          },
        ),
      );

      this.setToken(response.token);
      this.setCurrentAdmin(response.admin);
      this.loadingService.hide(LoadingKeys.GLOBAL);

      return { success: true };
    } catch (error: any) {
      this.loadingService.hide(LoadingKeys.GLOBAL);
      return {
        success: false,
        error: error.error?.error || 'Login failed',
      };
    }
  }

  /**
   * Validates the current admin token
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const headers = new HttpHeaders().set('X-Admin-Token', token);
      const response = await firstValueFrom(
        this.http.get<AdminValidateResponse>(
          `${environment.apiUrl}/admin/auth/validate`,
          { headers },
        ),
      );

      if (response.valid && response.admin) {
        this.setCurrentAdmin(response.admin);
        return true;
      }

      return false;
    } catch {
      this.clearToken();
      this.setCurrentAdmin(null);
      return false;
    }
  }

  /**
   * Logs out the current admin
   */
  async logout(): Promise<void> {
    this.loadingService.show(LoadingKeys.GLOBAL, true);

    const token = this.getToken();
    if (token) {
      try {
        const headers = new HttpHeaders().set('X-Admin-Token', token);
        await firstValueFrom(
          this.http.post(
            `${environment.apiUrl}/admin/auth/logout`,
            {},
            { headers },
          ),
        );
      } catch {
        // Ignore errors during logout
      }
    }

    this.clearToken();
    this.setCurrentAdmin(null);
    this.loadingService.hide(LoadingKeys.GLOBAL);
  }

  /**
   * Updates the admin's password
   */
  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const headers = new HttpHeaders().set('X-Admin-Token', token);
      await firstValueFrom(
        this.http.put(
          `${environment.apiUrl}/admin/auth/password`,
          { current_password: currentPassword, new_password: newPassword },
          { headers },
        ),
      );

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.error?.error || 'Failed to update password',
      };
    }
  }
}
