import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup, UntypedFormControl } from '@angular/forms';

@Pipe({
  name: 'getControl',
  pure: false,
})
export class UbGetFormControlPipe implements PipeTransform {
  transform(form: FormGroup, controlName: string): UntypedFormControl {
    if (form) {
      const control = form?.get(controlName);

      if (control) {
        return control as UntypedFormControl;
      } else {
        this.throwError(
          `Control '${controlName}' does not exist on form.`,
          form
        );
        return new UntypedFormControl();
      }
    } else {
      this.throwError(`Form does not exist`, form);
      return new UntypedFormControl();
    }
  }

  throwError(error: string, form?: FormGroup): void {
    throw new Error(error);
  }
}
