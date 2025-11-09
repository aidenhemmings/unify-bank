import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbSupabaseService {
  private http = inject(HttpClient);
  private currentToken: string | null = null;
  private apiUrl = environment.apiUrl;

  constructor() {
    const token = localStorage.getItem('user_token');
    if (token) {
      this.currentToken = token;
    }
  }

  async signIn(username: string, password: string) {
    try {
      const response = await firstValueFrom(
        this.http.post<{ user: any; token: string }>(
          `${this.apiUrl}/auth/login`,
          { username, password }
        )
      );

      return { user: response.user, token: response.token, error: null };
    } catch (error: any) {
      return {
        user: null,
        token: null,
        error: { message: error.error?.error || 'Login failed' },
      };
    }
  }

  async validateToken(token: string) {
    try {
      const response = await firstValueFrom(
        this.http.get<{ valid: boolean; user: any }>(
          `${this.apiUrl}/auth/validate`,
          {
            headers: new HttpHeaders({
              'X-User-Token': token,
            }),
          }
        )
      );

      return { userId: response.user?.id, user: response.user, error: null };
    } catch (error) {
      return { userId: null, user: null, error };
    }
  }

  async getUserById(userId: string) {
    try {
      const headers = this.getAuthHeaders();

      if (!this.currentToken) {
        return { user: null, error: { message: 'No authentication token' } };
      }

      const response = await firstValueFrom(
        this.http.get<{ user: any }>(`${this.apiUrl}/users/profile`, {
          headers: headers,
        })
      );

      return { user: response.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  async invalidateToken(token: string) {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/auth/logout`,
          {},
          {
            headers: new HttpHeaders({
              'X-User-Token': token,
            }),
          }
        )
      );

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async hashPassword(password: string): Promise<string> {
    return password;
  }

  async updateUser(form: any): Promise<{ success: boolean; data?: any }> {
    if (!form) return { success: false };

    const user = form.value;

    try {
      const response = await firstValueFrom(
        this.http.put<{ user: any }>(
          `${this.apiUrl}/users/profile`,
          {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
          },
          {
            headers: this.getAuthHeaders(),
          }
        )
      );

      return { success: true, data: response.user };
    } catch (error) {
      return { success: false };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      await firstValueFrom(
        this.http.put(
          `${this.apiUrl}/users/change-password`,
          {
            current_password: currentPassword,
            new_password: newPassword,
          },
          {
            headers: this.getAuthHeaders(),
          }
        )
      );

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.error?.error || 'Failed to change password' },
      };
    }
  }

  getSupabaseClient(): any {
    return null;
  }

  async setToken(token: string): Promise<void> {
    this.currentToken = token;
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-User-Token': this.currentToken || '',
    });
  }
}
