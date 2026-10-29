import { FormBuilder, Validators } from '@angular/forms';

export class StockOutputsForms {
  static today() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  static createForm(fb: FormBuilder) {
    return fb.nonNullable.group({
      idSolicitud: [0, [Validators.required, Validators.min(1)]],
      idTipoArticulo: [0, [Validators.required, Validators.min(1)]],
      idTipoSalida: [0, [Validators.required, Validators.min(1)]],
      idRecinto: [0, [Validators.required, Validators.min(1)]],
      noRequerimiento: ['', Validators.required],
      solicitante: ['', Validators.required],
      solicitanteCargo: ['', Validators.required],
      unidadOrganizativa: ['', Validators.required],
      fechaCreacion: [this.today(), Validators.required],
      observacion: [''],
    });
  }

  static createDetailForm(fb: FormBuilder) {
    return fb.nonNullable.group({
      requestDetailId: [0, [Validators.required, Validators.min(1)]],
      idProducto: [0, [Validators.required, Validators.min(1)]],
      nombre: ['', Validators.required],
      cantSolicitada: [0],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      marca: [''], modelo: [''], condicion: [''], serial: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      idTipoAlmcacen: [0, [Validators.required, Validators.min(1)]],
      idEntradaDetalle: [0, [Validators.required, Validators.min(1)]],
    });
  }
}
