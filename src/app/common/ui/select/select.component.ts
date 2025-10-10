import {
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UbInputBaseComponent } from '../input';

@Component({
  selector: 'ub-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  imports: [SelectModule, FormsModule, ReactiveFormsModule, CommonModule],
  encapsulation: ViewEncapsulation.None,
})
export class UbSelectComponent extends UbInputBaseComponent {
  @Input() options: any[] = [];
  @Input() optionLabel!: string;
  @Input() optionValue!: string;
  @Input() size!: 'lg' | 'sm';
  @Input() appendTo = 'body';
  @Input() optionTemplate?: TemplateRef<any>;
  @Input() filter!: boolean;
  @Input() filterBy!: string;
  @Input() showClear!: boolean;
}
