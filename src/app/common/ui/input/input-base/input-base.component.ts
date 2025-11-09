import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  DefaultValueAccessor,
  UntypedFormControl,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

DefaultValueAccessor.prototype.registerOnChange = function (
  fn: (_: any) => void
): void {
  this.onChange = (value: any): any => {
    fn(value === '' ? null : value);
  };
};

export const DEFAULT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef((): any => DefaultValueAccessor),
  multi: true,
};

@Component({
  selector: 'ub-input-base',
  template: '',
  imports: [FormsModule, ReactiveFormsModule],
  providers: [DEFAULT_VALUE_ACCESSOR],
})
export abstract class UbInputBaseComponent implements ControlValueAccessor {
  @Output() public blurred: EventEmitter<any> = new EventEmitter<any>();
  @Output() public clicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() public focused: EventEmitter<any> = new EventEmitter<any>();
  @Output() public valueChanged: EventEmitter<any> = new EventEmitter<any>();

  @Input() public placeholder = '';
  @Input() public id = '';

  @Input() value!: any;

  protected _formControl!: UntypedFormControl;
  protected _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  @Input('control')
  get formControl(): UntypedFormControl {
    return this._formControl;
  }
  set formControl(formControl: UntypedFormControl) {
    this._formControl = formControl;
    if (!formControl) {
      return;
    }

    formControl.registerOnDisabledChange((isDisabled): void => {
      this._disabled = isDisabled;
    });

    if (formControl.disabled) {
      this._disabled = formControl.disabled;
    }
  }

  public onBlur(): void {
    this.blurred.emit();
  }

  onChange(value: any): void {
    this.valueChanged.emit(value);
  }

  onTouched(): void {}

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
