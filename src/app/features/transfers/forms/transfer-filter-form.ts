import { FormBuilder } from '@angular/forms';

export class TransferFilterForm {
  static create(fb: FormBuilder) {
    return fb.nonNullable.group({ filter: [''] });
  }
}
