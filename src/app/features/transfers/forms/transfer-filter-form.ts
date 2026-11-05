import { FormBuilder, ValidatorFn } from '@angular/forms';

const dateRange: ValidatorFn = control => {
  const { Desde, Hasta } = control.value;
  return Desde && Hasta && Desde > Hasta ? { dateRange: true } : null;
};

export class TransferFilterForm {
  static create(fb: FormBuilder) {
    return fb.group({
      CreadoPor: fb.control<string | null>(null),
      Estado: fb.control<string | null>(null),
      Desde: fb.control<string | null>(null),
      Hasta: fb.control<string | null>(null),
    }, { validators: dateRange });
  }
}
