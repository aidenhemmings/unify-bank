import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UbUserSettingsService,
  UbUserService,
  UbToastService,
} from '@common/services';
import { UserSettings } from '@common/types';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'ub-user-settings-modal',
  templateUrl: './user-settings-modal.component.html',
  styleUrls: ['./user-settings-modal.component.scss'],
  imports: [CommonModule],
})
export class UbUserSettingsModalComponent implements OnInit {
  private userSettingsService = inject(UbUserSettingsService);
  private userService = inject(UbUserService);
  private toastService = inject(UbToastService);
  private ref = inject(DynamicDialogRef);

  settings: UserSettings | null = null;
  isLoading = false;
  isSaving = false;

  ngOnInit(): void {
    this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return;

    this.isLoading = true;
    const { settings, error } = await this.userSettingsService.getUserSettings(
      currentUser.id
    );

    if (error) {
      this.toastService.error('Error', 'Failed to load settings.');
    } else {
      this.settings = settings;
    }

    this.isLoading = false;
  }

  async toggleDarkMode(): Promise<void> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !this.settings) return;

    this.isSaving = true;

    const { settings, error } =
      await this.userSettingsService.updateUserSettings(currentUser.id, {
        is_light_mode: !this.settings.is_light_mode,
      });

    if (error) {
      this.toastService.error('Error', 'Failed to update settings.');
    } else if (settings) {
      this.settings = settings;
      this.userSettingsService.applyTheme(settings.is_light_mode);
      this.toastService.success(
        'Success',
        `${settings.is_light_mode ? 'Light' : 'Dark'} mode enabled.`
      );
    }

    this.isSaving = false;
  }

  close(): void {
    this.ref.close();
  }
}
