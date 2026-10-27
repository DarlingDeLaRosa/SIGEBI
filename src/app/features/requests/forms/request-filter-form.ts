import { FormBuilder } from '@angular/forms';

export class RequestFiltersForms {
  static filters(fb: FormBuilder) {
    return fb.group({
      noRequerimiento: fb.nonNullable.control(''),
      idEstadoSolicitud: fb.control<number | null>(null),
      idTipoArticulo: fb.control<number | null>(null),
      idTipoSolicitud: fb.control<number | null>(null),
      unidadOrganizativa: fb.nonNullable.control(''),
      idRecinto: fb.control<number | null>(null),
    });
  }
}
