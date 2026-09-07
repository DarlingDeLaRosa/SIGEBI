export interface CreateStockEntryDto {
  idOrdenCompra: number;
  idTipoEntrada: number;
  id: number;
  idTipoEntrega: number;
  idProveedor: number;
  noFactura: string;
  fechaFactura: string;
  itbisGeneral: number;
  total: number;
  observacion: string;
  itbisGeneralEstado: boolean;
  noConduce: string;
  detalle: StockEntryDetailDto[];
}

export interface StockEntryDetailDto {
  idEntradaDet: number;
  idProducto: number;
  marca: string;
  modelo: string;
  condicion: string;
  serial: string;
  precio: number;
  cantidad: number;
  itbisProducto: number;
  subTotal: number;
  idEntrada: number;
  idTipoAlmcacen: number;
  observacion: string;
  idDetalleOrden: number;
}