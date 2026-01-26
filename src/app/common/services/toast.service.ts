import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class UbToastService {
  private messageService = inject(MessageService);

  /**
   * Shows a success toast message.
   * @param summary The summary text of the toast.
   * @param detail The detail text of the toast.
   * @param sticky Whether the toast should stick around until manually closed.
   */
  success(
    summary?: string,
    detail: string = '',
    sticky: boolean = false
  ): void {
    this.messageService.add({ severity: 'success', summary, detail, sticky });
  }

  /**
   * Shows an info toast message.
   * @param summary - The summary text of the toast.
   * @param detail - The detail text of the toast.
   * @param sticky - Whether the toast should stick around until manually closed.
   */
  info(summary: string, detail: string = '', sticky: boolean = false): void {
    this.messageService.add({ severity: 'info', summary, detail, sticky });
  }

  /**
   * Shows a warning toast message.
   * @param summary - The summary text of the toast.
   * @param detail - The detail text of the toast.
   * @param sticky - Whether the toast should stick around until manually closed.
   */
  warn(summary: string, detail: string = '', sticky: boolean = false): void {
    this.messageService.add({ severity: 'warn', summary, detail, sticky });
  }

  /**
   * Shows an error toast message.
   * @param summary - The summary text of the toast.
   * @param detail - The detail text of the toast.
   * @param sticky - Whether the toast should stick around until manually closed.
   */
  error(summary: string, detail: string = '', sticky: boolean = false): void {
    this.messageService.add({ severity: 'error', summary, detail, sticky });
  }

  /**
   * Shows a custom toast message.
   * @param severity - The severity of the toast.
   * @param summary - The summary text of the toast.
   * @param detail - The detail text of the toast.
   * @param sticky - Whether the toast should stick around until manually closed.
   * @param key - The key for the toast.
   */
  custom(
    severity: string,
    summary: string,
    detail: string = '',
    sticky: boolean = false,
    key?: string
  ): void {
    this.messageService.add({ severity, summary, detail, sticky, key: key });
  }

  /**
   * Clears toast messages.
   * @param key - The key of the toast messages to clear. If not provided, clears all messages.
   */
  clear(key?: string) {
    this.messageService.clear(key);
  }
}
