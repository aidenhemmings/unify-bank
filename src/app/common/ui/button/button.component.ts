import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonType } from './types';
import { ButtonModule } from 'primeng/button';

/**
 * A reusable button component with various styles and sizes.
 */
@Component({
  selector: 'ub-button',
  templateUrl: 'button.component.html',
  styleUrls: ['button.component.scss'],
  imports: [CommonModule, ButtonModule],
})
export class UbButtonComponent {
  @Input() variant!: ButtonType;
  @Input() size!: 'vs' | 'sm' | 'md' | 'lg';
  @Input() fluid = false;
  @Input() disabled!: boolean;
  @Input() loading = false;

  get variantClass(): string {
    if (this.variant) {
      return `p-button-${this.variant}`;
    }
    return '';
  }
}
