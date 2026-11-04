import { FormBuilder, ValidatorFn } from '@angular/forms';

const dateRange: ValidatorFn = control => {
  const { desde, hasta } = control.value;
  return desde && hasta && desde > hasta ? { dateRange: true } : null;
};

export class OutputFilterForms {
  static create(fb: FormBuilder) {
    return fb.group({
      idDepartamento: fb.control<number | null>(null),
      idTipoSalida: fb.control<number | null>(null),
      idRecinto: fb.control<number | null>(null),
      desde: fb.nonNullable.control(''),
      hasta: fb.nonNullable.control(''),
      idSolicitud: fb.control<number | null>(null),
      solicitante: fb.nonNullable.control(''),
      noRequerimiento: fb.nonNullable.control(''),
    }, { validators: dateRange });
  }
}
