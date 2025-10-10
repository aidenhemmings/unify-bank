import { Injectable, inject } from '@angular/core';
import { UbSupabaseService } from './supabase.service';
import { UserSettings } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbUserSettingsService {
  private supabaseService = inject(UbSupabaseService);

  private settingsSubject = new BehaviorSubject<UserSettings | null>(null);

  get currentSettings(): Observable<UserSettings | null> {
    return this.settingsSubject.asObservable();
  }

  getCurrentSettingsValue(): UserSettings | null {
    return this.settingsSubject.value;
  }

  setCurrentSettings(settings: UserSettings | null): void {
    this.settingsSubject.next(settings);
  }

  async getUserSettings(
    userId: string
  ): Promise<{ settings: UserSettings | null; error: any }> {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return this.createUserSettings(userId);
      }
      return { settings: null, error };
    }

    this.setCurrentSettings(data);
    return { settings: data, error: null };
  }

  async createUserSettings(
    userId: string
  ): Promise<{ settings: UserSettings | null; error: any }> {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('user_settings')
      .insert({
        user_id: userId,
        is_light_mode: true,
      })
      .select()
      .single();

    if (error) {
      return { settings: null, error };
    }

    this.setCurrentSettings(data);
    return { settings: data, error: null };
  }

  async updateUserSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<{ settings: UserSettings | null; error: any }> {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { settings: null, error };
    }

    this.setCurrentSettings(data);
    return { settings: data, error: null };
  }

  async toggleDarkMode(userId: string): Promise<{ success: boolean }> {
    const currentSettings = this.getCurrentSettingsValue();
    if (!currentSettings) {
      return { success: false };
    }

    const { error } = await this.updateUserSettings(userId, {
      is_light_mode: !currentSettings.is_light_mode,
    });

    return { success: !error };
  }

  applyTheme(isLightMode: boolean): void {
    if (isLightMode) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }
  }
}
