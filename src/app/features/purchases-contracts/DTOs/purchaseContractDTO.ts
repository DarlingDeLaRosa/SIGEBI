export interface CreatePurchaseContractDto {
    id: number,
    noExpediente: string,
    noOrden: string,
    descripcion: string,
    modalidadCompra: string,
    idProveedor: number,
    anticipo: number,
    formaPago: string,
    plazoPago: number,
    moneda: string,
    subTotal: number,
    totalDescuento: number,
    totalItbis: number,
    totalOtrosImpuestos: number,
    total: number,
    detalles: CreatePurchaseContractDetailDto[]
}

export interface CreatePurchaseContractDetailDto {
    idOrdenCompra: number,
    idProducto: number;
    noItem: number;
    descripcion: string;
    cantidad: number;
    idUnidad: number;
    precioUnitario: number;
    importeMonedaOrig: number;
    descuento: number;
    itbismoneda: number;
    otrosImpuestosMoneda: number;
    subTotalMoneda: number;
}

export interface UpdatePurchasesContractDTO extends CreatePurchaseContractDto {
    id: number,
}

export interface UpdatePurchasesContractDetailDTO extends CreatePurchaseContractDetailDto {
    idOrdenCompra: number,
}