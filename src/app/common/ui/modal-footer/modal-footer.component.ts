import { Component, inject } from '@angular/core';
import { ButtonType, UbButtonComponent } from '../button';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UbModalFormService } from '@common/services';
import { ModalResponse } from '@common/types/modal-response.type';
import { Common, ModalResponseTypes } from '@common/enums';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-modal-footer',
  templateUrl: './modal-footer.component.html',
  styleUrls: ['./modal-footer.component.scss'],
  imports: [UbButtonComponent, CommonModule],
})
export class UbModalFooterComponent {
  config = inject(DynamicDialogConfig);
  ref = inject(DynamicDialogRef);
  modalForm = inject(UbModalFormService);

  form: FormGroup | null = null;

  showFooter = true;

  get disabled(): boolean {
    if (!this.form) return false;
    return this.form.invalid || !this.form.dirty;
  }

  get cancelText(): string {
    return this.config?.data?.cancelText ?? 'Cancel';
  }

  get confirmText(): string {
    return this.config?.data?.confirmText ?? 'Confirm';
  }

  get cancelVariant(): ButtonType {
    return this.config.data.cancelVariant ?? 'outline';
  }

  get confirmVariant(): ButtonType {
    return this.config.data.confirmVariant ?? 'primary';
  }

  get showCancel(): boolean {
    return this.config?.data?.showCancel ?? true;
  }

  get showConfirm(): boolean {
    return this.config?.data?.showConfirm ?? true;
  }

  get isFooterVisible(): boolean {
    const key = this.config?.data?.footerKey;
    if (key === Common.SHOW_IF_DIRTY) {
      return this.form ? this.form.dirty : false;
    } else {
      return true;
    }
  }

  constructor() {
    this.modalForm
      .getForm()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          this.form = response;
        },
      });
  }

  public cancel(): void {
    const response: ModalResponse = {
      form: this.form ?? undefined,
      type: ModalResponseTypes.CANCEL,
    };

    this.ref.close(response);
  }

  public confirm(): void {
    const response: ModalResponse = {
      form: this.form ?? undefined,
      type: ModalResponseTypes.CONFIRM,
    };

    this.ref.close(response);
  }
}
