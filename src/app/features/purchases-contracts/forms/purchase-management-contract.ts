import { FormBuilder, Validators } from "@angular/forms";

export class PurchaseContractForms {

    static createForm(fb: FormBuilder) {
        return fb.nonNullable.group({
            id: [''],
            noExpediente: ['', Validators.required],
            noOrden: ['', Validators.required],
            descripcion: [''],
            modalidadCompra: ['', Validators.required],
            idProveedor: [0, Validators.required],
            anticipo: [0],
            formaPago: ['', Validators.required],
            plazoPago: [],
            moneda: ['', Validators.required],
            subTotal: [0],
            totalDescuento: [0],
            totalItbis: [0],
            totalOtrosImpuestos: [0],
            total: [0],
        });
    }

    static createDetailForm(fb: FormBuilder) {
        return fb.nonNullable.group({
            idProducto: [, Validators.required],
            cantidad: [, Validators.required],
            precioUnitario: [, Validators.required],
            idOrdenCompra: [],
            idUnidadMe: [],
            catalog: [],
            importeMonedaOrig: [],
            noItem: [],
            descripcion: [''],
            descuento: [],
            itbismoneda: [, Validators.required],
            otrosImpuestosMoneda: [],
            subTotalMoneda: []
        });
    }
}