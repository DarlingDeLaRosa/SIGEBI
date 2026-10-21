import { CreateStockEntryDto, StockEntryDetailDto } from "../DTOs/entries-Form-DTO";
import { StockEntryDetailFormValue, StockEntryFormValue } from "../DTOs/entries-form-value";


export class StockEntryMapper {

  static toCreateDto(
    form: StockEntryFormValue,
    details: StockEntryDetailFormValue[]
  ): CreateStockEntryDto {

    return {
      idOrdenCompra: Number(form.idOrdenCompra),
      idTipoEntrada: Number(form.idTipoEntrada),
      id: Number(form.id) || 0,
      idTipoEntrega: Number(form.idTipoEntrega),
      idProveedor: Number(form.idProveedor),

      noFactura: form.noFactura?.trim() ?? '',

      fechaFactura: this.toIsoDate(form.fechaFactura),

      itbisGeneral: Number(form.itbisGeneral) || 0,
      total: Number(form.total) || 0,

      observacion: form.observacion?.trim() ?? '',

      itbisGeneralEstado: Boolean(form.itbisGeneralEstado),

      noConduce: form.noConduce?.trim() ?? '',

      detalle: details.map(detail =>
        this.mapDetail(detail)
      )
    };
  }

  private static mapDetail(
    detail: StockEntryDetailFormValue
  ): StockEntryDetailDto {

    return {
      idEntradaDet: Number(detail.idEntradaDet) || 0,

      idProducto: Number(detail.idProducto),

      marca: detail.marca?.trim() ?? '',

      modelo: detail.modelo?.trim() ?? '',

      condicion: detail.condicion?.value ?? '',

      serial: detail.serial?.trim() ?? '',

      precio: Number(detail.precio) || 0,

      cantidad: Number(detail.cantidad) || 0,

      itbisProducto: Number(detail.itbisProducto) || 0,

      subTotal: Number(detail.subTotal) || 0,

      idEntrada: Number(detail.idEntrada) || 0,

      idTipoAlmcacen: Number(detail.idTipoAlmcacen?.idTipoAlm) || 0,

      observacion: detail.observacion?.trim() ?? '',

      idDetalleOrden: Number(detail.idDetalleOrden)
    };
  }

  private static toIsoDate(date: string): string {
    if (!date) return '';

    return new Date(`${date}T00:00:00`).toISOString();
  }

  static fromApiDetail(detail: any, idOrden: number) {
    console.log(detail);
    
    return {

      idEntradaDet: detail.idEntradaDet,
      nombre:  detail.producto.nombre,
      idProducto: detail.producto.idProducto,
      marca: detail.marca ,
      modelo: detail.modelo ,
      condicion: detail.condicion,
      serial: detail.serial ,
      precio: detail.precio ,
      cantidad: detail.cantidad ,
      itbisProducto: detail.itbisProducto,
      subTotal: detail.subTotal ,
      idEntrada: detail.idEntrada ,
      // idTipoAlmcacen: detail,
      observacion: detail.observacion ,
      idDetalleOrden: idOrden,
    };

  }
}