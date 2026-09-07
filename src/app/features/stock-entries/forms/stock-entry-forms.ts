import { FormBuilder, Validators } from "@angular/forms";

export class StockEntryForms {

    static createForm(fb: FormBuilder) {
        return fb.nonNullable.group({
            id: [''],
            idTipoEntrada: [0, Validators.required],
            idOrdenCompra: [0, Validators.required],
            idTipoEntrega: [0, Validators.required],
            idProveedor: [0],
            fechaFactura: ['', Validators.required],
            itbisGeneral: [0,],
            total: [0],
            observacion: [''],
            itbisGeneralEstado: [0],
            noConduce: [''],
            noFactura: ['', Validators.required],
        });
    }

    static createDetailForm(fb: FormBuilder) {
        return fb.nonNullable.group({
            idEntradaDet: [0],
            nombre: [''],
            idProducto: [0, Validators.required],
            marca: ['', Validators.required],
            modelo: ['',Validators.required],
            condicion: ['',Validators.required],
            serial: [''],
            precio: [0, Validators.required],
            cantidad: [0, Validators.required],
            itbisProducto: [0, Validators.required],
            subTotal: [0],
            idEntrada: [0],
            idTipoAlmcacen: ['', Validators.required],
            observacion: [''],
            idDetalleOrden: [0, Validators.required]
        });
    }
}