import { FormBuilder, Validators } from '@angular/forms';

export class RequestForms {

  static createForm(fb: FormBuilder) {
    return fb.nonNullable.group({
      idRecinto: [0, [Validators.required, Validators.min(1)]],
      idTipoArticulo: [0, [Validators.required, Validators.min(1)]],
      idTipoSolicitud: [0, [Validators.required, Validators.min(1)]],

      solicitante: ['', Validators.required],
      cargoSolicitante: ['', Validators.required],
      unidadOrganizativa: ['', Validators.required],

      observaciones: ['']
    });
  }

  static createDetailForm(fb: FormBuilder) {
    return fb.nonNullable.group({
      idProducto: [0, [Validators.required, Validators.min(1)]],
      nombreProducto: ['', Validators.required],
      cantidadSolicitada: [0, [
        Validators.required,
        Validators.min(Number.MIN_VALUE)
      ]]
    });
  }

}