import { ProductModel } from "../../products/model/productModel"

export interface purchaseDetailContractModel {
    idOrdenCompra: number,
    calCantidad: number,
    idProducto: number,
    productoObj: ProductModel
    descripcion: string,
    cantidad: number,
    idUnidad: number,
    unidadObj: {
        idUnidadMe: number,
        descripcion: string
    },
    precioUnitario: number,
    importeMonedaOrig: number,
    descuento: number,
    itbismoneda: number,
    otrosImpuestosMoneda: number,
    subTotalMoneda: number
}