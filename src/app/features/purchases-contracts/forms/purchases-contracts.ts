import { FormBuilder, Validators } from "@angular/forms";

export class PurchaseContractFiltersForms {

    static filters(fb: FormBuilder) {

        return fb.nonNullable.group({

            filter: [''],
            formaPago: [null],
            modalidadCompra: [null],
            estado: [null],
            idProveedor: [null],

        });
    }
}