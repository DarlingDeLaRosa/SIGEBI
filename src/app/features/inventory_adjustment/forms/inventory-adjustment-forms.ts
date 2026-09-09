import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

const integer: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || control.value === '' || Number.isInteger(control.value)
    ? null
    : { integer: true };

const nonBlank: ValidatorFn = (control) =>
  typeof control.value === 'string' && !control.value.trim() ? { required: true } : null;

export class InventoryAdjustmentForms {
  static filters(fb: FormBuilder) {
    return fb.group({
      campusId: fb.control<number | null>(null),
      warehouseId: fb.control<number | null>(null),
      countNumber: fb.nonNullable.control(''),
      productId: fb.control<number | null>(null),
    });
  }

  static create(fb: FormBuilder) {
    return fb.nonNullable.group(
      {
        id: 0,
        campusId: [0, [Validators.required, Validators.min(1)]],
        countNumber: ['', [Validators.required, nonBlank]],
        warehouseId: [0, [Validators.required, Validators.min(1)]],
        date: ['', Validators.required],
        startTime: ['', Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)],
        endTime: ['', Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)],
      },
      {
        validators: (control) => {
          const start = control.get('startTime')?.value;
          const end = control.get('endTime')?.value;
          if (!!start !== !!end) return { timePair: true };
          return start && end && end < start ? { timeOrder: true } : null;
        },
      },
    );
  }

  static participant(fb: FormBuilder) {
    return fb.nonNullable.group({
      name: ['', [Validators.required, nonBlank]],
      position: ['', [Validators.required, nonBlank]],
    });
  }

  static detail(fb: FormBuilder) {
    return fb.group({
      productId: fb.nonNullable.control(0, [Validators.required, Validators.min(1)]),
      entryDetailId: fb.nonNullable.control(0, [Validators.required, Validators.min(1)]),
      countedQuantity: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
        integer,
      ]),
      inventoryQuantity: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
        integer,
      ]),
      observations: fb.nonNullable.control(''),
    });
  }
}
