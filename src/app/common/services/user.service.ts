import { Injectable, inject } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { UbSupabaseService } from './supabase.service';
import { LoadingKeys } from '@common/enums';
import { UbLoadingService } from './loading.service';
import { UbUserSettingsService } from './user-settings.service';

@Injectable({
  providedIn: 'root',
})
export class UbUserService {
  private loadingService = inject(UbLoadingService);
  private supabaseService = inject(UbSupabaseService);
  private userSettingsService = inject(UbUserSettingsService);

  private userSubject = new BehaviorSubject<User | null>(null);
  private readonly TOKEN_KEY = 'user_token';

  get currentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  async setCurrentUser(user: User | null): Promise<void> {
    this.userSubject.next(user);

    if (user) {
      const { settings } = await this.userSettingsService.getUserSettings(
        user.id
      );
      if (settings) {
        this.userSettingsService.applyTheme(settings.is_light_mode);
      }
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  async clearSession(): Promise<void> {
    this.loadingService.show(LoadingKeys.GLOBAL, true);
    const token = this.getToken();

    if (token) {
      await this.supabaseService.invalidateToken(token);
    }

    this.userSubject.next(null);
    this.userSettingsService.setCurrentSettings(null);
    // Reset to default light mode on logout
    this.userSettingsService.applyTheme(true);
    localStorage.removeItem(this.TOKEN_KEY);
    this.loadingService.hide(LoadingKeys.GLOBAL);
  }
}
