import { FormBuilder, Validators } from '@angular/forms';

export class RequestForms {

  static createForm(fb: FormBuilder) {
    return fb.nonNullable.group({
      idRecinto: [0, Validators.required],
      idTipoArticulo: [0, Validators.required],
      idTipoSolicitud: [0, Validators.required],

      solicitante: ['', Validators.required],
      cargoSolicitante: ['', Validators.required],
      unidadOrganizativa: ['', Validators.required],

      observaciones: ['']
    });
  }

  static createDetailForm(fb: FormBuilder) {
    return fb.nonNullable.group({
      idProducto: [0, Validators.required],
      nombreProducto: ['', Validators.required],
      cantidadSolicitada: [0, [
        Validators.required,
        Validators.min(1)
      ]]
    });
  }

}