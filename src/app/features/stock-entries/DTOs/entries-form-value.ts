export interface StockEntryFormValue {
  id: number | string;
  idOrdenCompra: number;
  idProveedor: number;
  idTipoEntrada: number;
  idTipoEntrega: number;
  noFactura: string;
  fechaFactura: string;
  itbisGeneral: number;
  itbisGeneralEstado: boolean | number;
  noConduce: string;
  observacion: string;
  total: number;
}

export interface StockEntryDetailFormValue {
  idEntradaDet: number;
  idProducto: number;
  marca: string;
  modelo: string;
  condicion: {
    name: string;
    value: string;
  };
  serial: string;
  precio: number;
  cantidad: number;
  itbisProducto: number;
  subTotal: number;
  idEntrada: number;
  idTipoAlmcacen: {
    idTipoAlm: number;
    nombre: string;
  };
  observacion: string;
  idDetalleOrden: number;
}