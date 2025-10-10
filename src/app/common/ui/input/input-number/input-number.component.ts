import { Component, Input, ViewEncapsulation } from '@angular/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbInputBaseComponent } from '../input-base';

@Component({
  selector: 'ub-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  imports: [InputNumberModule, FormsModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class UbInputNumberComponent extends UbInputBaseComponent {
  @Input() mode!: string;
  @Input() useGrouping!: boolean;
  @Input() minFractionDigits!: string;
  @Input() maxFractionDigits!: string;
  @Input() min!: string;
  @Input() max!: string;
  @Input() prefix!: string;
  @Input() suffix!: string;
}
