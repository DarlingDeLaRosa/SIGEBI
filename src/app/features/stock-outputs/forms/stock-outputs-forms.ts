import { FormBuilder, Validators } from "@angular/forms";

export class StockOutputsForms {

    static createForm(fb: FormBuilder) {
        return fb.nonNullable.group({
            idSalida: [0],
            idTipoSalida: [0, Validators.required],
            idDepar: [0, Validators.required],
            idRecinto: [0, Validators.required],

            observacion: [''],
            total: [0],
            fechaCreacion: [new Date().toISOString().substring(0, 10)]
        });
    }

    static createDetailForm(fb: FormBuilder) {
        return fb.nonNullable.group({
            idSalidaDet: [0],
            idProducto: [0, Validators.required],

            cantidad: [1, Validators.required],

            marca: [''],
            modelo: [''],
            condicion: [null, Validators.required],
            serial: [''],

            precio: [0, Validators.required],
            subTotal: [0],

            idSalida: [0],
            idTipoAlmcacen: [null, Validators.required]
        });
    }
}