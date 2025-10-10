import { FormGroup } from '@angular/forms';
import { ModalResponseTypes } from '@common/enums';

export interface ModalResponse {
  form?: FormGroup;
  data?: any;
  type: ModalResponseTypes;
}
