import { FormBuilder } from "@angular/forms";

export class StockEntryFiltersForms {

    static filters(fb: FormBuilder) {

        return fb.nonNullable.group({

            noFactura: [''],
            idTipoEntrada: [null],
            idTipoEntrega: [null],
            idProveedor: [null],
            idRecinto: [null],
            desde: [null],
            hasta: [null],
            page: [null],
            cantItems: [null],
        });
    }
}