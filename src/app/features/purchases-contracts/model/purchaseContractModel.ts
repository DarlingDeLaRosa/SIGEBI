import { purchaseDetailContractModel } from "./detail-contract-model"

export interface purchaseContractModel {
    id: number,
    noExpediente: string,
    noOrden: string,
    descipcion: string,
    modalidadCompra: string,
    idProveedor: number,
    proveedorObj: {
        idProveedor: number,
        rnc: string,
        razonSocial: string,
        nombreComercial: string,
        estadoProveedor: string,
        representante: string,
        telRepresentante: string
    },
    anticipo: number,
    formaPago: string,
    plazoPago: number,
    moneda: string,
    subTotal: number,
    totalDescuento: number,
    totalItbis: number,
    totalOtrosImpuestos: number,
    total: number,
    estado: string,
    detalles: purchaseDetailContractModel[],
    planEnetrga: {
        id: number,
        noItem: number,
        descripcion: string,
        direccionEntrega: string,
        cantidadRequerida: number,
        fechaNececidad: Date
    }[]
}