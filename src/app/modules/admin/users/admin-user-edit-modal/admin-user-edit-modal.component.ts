import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UbModalFormService } from '@common/services';
import { AdminUser, UserRole } from '@common/types';
import { UbInputTextComponent, UbSelectComponent } from '@common/ui';
import { UbGetFormControlPipe } from '@common/pipes';

@Component({
  selector: 'ub-admin-user-edit-modal',
  templateUrl: './admin-user-edit-modal.component.html',
  styleUrls: ['./admin-user-edit-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UbInputTextComponent,
    UbSelectComponent,
    UbGetFormControlPipe,
  ],
})
export class UbAdminUserEditModalComponent implements OnInit {
  private dialogConfig = inject(DynamicDialogConfig);
  private modalFormService = inject(UbModalFormService);

  user!: AdminUser;
  isLoading = false;

  form = new FormGroup({
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    role: new FormControl<UserRole>('user', [Validators.required]),
  });

  roles: { label: string; value: UserRole }[] = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
  ];

  ngOnInit(): void {
    this.user = this.dialogConfig.data.user;

    this.form.patchValue({
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      role: this.user.role,
    });

    this.modalFormService.setForm(this.form);
  }
}
