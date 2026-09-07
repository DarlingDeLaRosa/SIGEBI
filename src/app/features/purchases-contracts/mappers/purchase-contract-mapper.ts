import { CreatePurchaseContractDto } from '../DTOs/purchaseContractDTO';
import { CreatePurchaseContractDetailDto } from '../DTOs/purchaseContractDTO';

export interface PurchaseTotals {
    subtotal: number;
    descuento: number;
    itbis: number;
    otrosImpuestos: number;
    total: number;
}

export class PurchaseContractMapper {

    static toCreateDto(
        header: any,
        details: any[],
        totals: PurchaseTotals
    ): CreatePurchaseContractDto {

        return {

            ...header,

            subTotal: totals.subtotal,
            totalDescuento: totals.descuento,
            totalItbis: totals.itbis,
            totalOtrosImpuestos: totals.otrosImpuestos,
            total: totals.total,

            detalles: details.map((detail, index) =>
                this.toDetailDto(detail, index)
            )
        };
    }

    private static toDetailDto(
        detail: any,
        index: number
    ): CreatePurchaseContractDetailDto {

        return {

            idOrdenCompra: detail.idOrdenCompra ?? 0,

            idProducto: detail.idProducto.idProducto,

            noItem: index + 1,

            descripcion: detail.descripcion,

            cantidad: detail.cantidad,

            idUnidad: detail.idUnidadMe.idUnidadMe,

            precioUnitario: detail.precioUnitario,

            importeMonedaOrig: detail.subtotal,

            descuento: detail.descuento ?? 0,

            itbismoneda: detail.totalItbis,

            otrosImpuestosMoneda: detail.otrosImpuestosMoneda ?? 0,

            subTotalMoneda: detail.subtotal

        };
    }

    static fromApiDetail(detail: any) {
        return {

            idOrdenCompra: detail.idOrdenCompra,

            idProducto: detail.productoObj,

            idUnidadMe: detail.unidadObj,

            catalog: detail.productoObj.catalogoObj?.definicionProducto ?? '',

            cantidad: detail.cantidad,

            precioUnitario: detail.precioUnitario,

            descripcion: detail.descripcion,

            descuento: detail.descuento,

            itbismoneda: detail.productoObj.itbis,

            otrosImpuestosMoneda: detail.otrosImpuestosMoneda,

            subtotal: detail.importeMonedaOrig,

            totalItbis: detail.itbismoneda,

            total: detail.subTotalMoneda + detail.itbismoneda
        };

    }
}