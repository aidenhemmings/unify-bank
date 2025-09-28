import { Component, Input, ViewEncapsulation } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { UbInputBaseComponent } from '../input-base';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ub-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  imports: [InputTextModule, FormsModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class UbInputTextComponent extends UbInputBaseComponent {
  @Input() type = 'text';
  @Input() readOnly!: boolean;
}
