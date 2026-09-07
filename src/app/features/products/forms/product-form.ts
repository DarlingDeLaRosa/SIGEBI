import { FormBuilder, Validators } from "@angular/forms";
import { ProductModel } from "../model/productModel";

export class ProductForms {

    static create(fb: FormBuilder) {

        return fb.group({

            idProducto: fb.nonNullable.control(0),
            nombre: fb.nonNullable.control('', Validators.required),
            precio: fb.nonNullable.control(0, Validators.required),
            itbis: fb.nonNullable.control(0, Validators.required),
            idCatalogo: fb.control<number | null>(null, Validators.required),
            descripcion: fb.nonNullable.control('', Validators.required),
            stockMinimo: fb.nonNullable.control(0, Validators.required),
            idUnidadMe: fb.control<number | null>(null, Validators.required),
            idTipoArt: fb.control<number | null>(null, Validators.required),

        });

    }

    static filters(fb: FormBuilder) {

        return fb.nonNullable.group({

            filter: [''],
            idCatalogo: [null],
            idTipoArticulo: [null],

        });
    }

    static toEditValue(product: ProductModel) {
        
        return {
            ...product,

            idCatalogo: product.catalogoObj.id,
            idTipoArt: product.tipoArticuloObj.idTipoArt,
            idUnidadMe: product.unidadMedidaObj.idUnidadMe,

        };

    }
}