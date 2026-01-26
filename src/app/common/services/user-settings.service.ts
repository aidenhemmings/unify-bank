import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UbSupabaseService } from './supabase.service';
import { UserSettings } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbUserSettingsService {
  private http = inject(HttpClient);
  private supabaseService = inject(UbSupabaseService);
  private apiUrl = environment.apiUrl;

  private settingsSubject = new BehaviorSubject<UserSettings | null>(null);

  /**
   * Retrieves current user settings
   */
  get currentSettings(): Observable<UserSettings | null> {
    return this.settingsSubject.asObservable();
  }

  /**
   * Retrieves current user settings value
   * @returns A UserSettings object or null
   */
  getCurrentSettingsValue(): UserSettings | null {
    return this.settingsSubject.value;
  }

  /**
   * Sets the current user settings
   * @param settings - The UserSettings object to set
   */
  setCurrentSettings(settings: UserSettings | null): void {
    this.settingsSubject.next(settings);
  }

  /**
   * Retrieves user settings from the server.
   * @param userId - The ID of the user.
   * @returns A promise resolving to an object containing the settings and any error.
   */
  async getUserSettings(
    userId: string
  ): Promise<{ settings: UserSettings | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ settings: UserSettings }>(
          `${this.apiUrl}/users/settings`,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      this.setCurrentSettings(response.settings);
      return { settings: response.settings, error: null };
    } catch (error: any) {
      return { settings: null, error };
    }
  }

  /**
   * Creates user settings for a new user.
   * @param userId - The ID of the user.
   * @returns A promise resolving to an object containing the settings and any error.
   */
  async createUserSettings(
    userId: string
  ): Promise<{ settings: UserSettings | null; error: any }> {
    return this.getUserSettings(userId);
  }

  /**
   * Updates existing user settings.
   * @param userId - The ID of the user.
   * @param updates - The updates to apply to the user settings.
   * @returns A promise resolving to an object containing the updated settings and any error.
   */
  async updateUserSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<{ settings: UserSettings | null; error: any }> {
    try {
      const response = await firstValueFrom(
        this.http.put<{ settings: UserSettings }>(
          `${this.apiUrl}/users/settings`,
          updates,
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      this.setCurrentSettings(response.settings);
      return { settings: response.settings, error: null };
    } catch (error: any) {
      return { settings: null, error };
    }
  }

  /**
   * Toggles light/dark mode for the user.
   * @param userId - The user ID to apply the toggle for.
   * @returns A promise resolving to an object containing the settings and any error.
   */
  async toggleDarkMode(userId: string): Promise<{ success: boolean }> {
    try {
      const response = await firstValueFrom(
        this.http.patch<{ settings: UserSettings }>(
          `${this.apiUrl}/users/settings/toggle-dark-mode`,
          {},
          {
            headers: this.supabaseService.getAuthHeaders(),
          }
        )
      );

      this.setCurrentSettings(response.settings);
      return { success: true };
    } catch (error: any) {
      return { success: false };
    }
  }

  /**
   * Applies the theme to the document based on user settings.
   * @param isLightMode - Whether light mode is enabled.
   */
  applyTheme(isLightMode: boolean): void {
    const htmlElement = document.documentElement;

    if (isLightMode) {
      htmlElement.classList.remove('dark-mode');
      htmlElement.classList.add('light-mode');
    } else {
      htmlElement.classList.remove('light-mode');
      htmlElement.classList.add('dark-mode');
    }
  }
}
