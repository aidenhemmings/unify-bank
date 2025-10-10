import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class UbToastService {
  private messageService = inject(MessageService);

  success(
    summary?: string,
    detail: string = '',
    sticky: boolean = false
  ): void {
    this.messageService.add({ severity: 'success', summary, detail, sticky });
  }

  info(summary: string, detail: string = '', sticky: boolean = false): void {
    this.messageService.add({ severity: 'info', summary, detail, sticky });
  }

  warn(summary: string, detail: string = '', sticky: boolean = false): void {
    this.messageService.add({ severity: 'warn', summary, detail, sticky });
  }

  error(summary: string, detail: string = '', sticky: boolean = false): void {
    this.messageService.add({ severity: 'error', summary, detail, sticky });
  }

  custom(
    severity: string,
    summary: string,
    detail: string = '',
    sticky: boolean = false,
    key?: string
  ): void {
    this.messageService.add({ severity, summary, detail, sticky, key: key });
  }

  clear(key?: string) {
    this.messageService.clear(key);
  }
}
