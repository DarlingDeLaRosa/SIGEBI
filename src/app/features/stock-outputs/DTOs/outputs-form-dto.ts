export interface OutputStock {
  idTipoAlmacen: number;
  tipoAlmacenObj: { idTipoAlm: number; nombre: string } | null;
  cantidad: number;
}

export interface DispatchProduct {
  idProducto: number;
  nombre: string;
  precio: number;
  stockPorAlmacen: OutputStock[] | null;
}

export interface OutputEntry {
  idEntradaDet: number;
  idEntrada: number | null;
  idTipoAlmacen: number;
  producto: { idProducto: number; nombre: string | null } | null;
  cantidad: number | null;
  marca: string | null;
  modelo: string | null;
  condicion: string | null;
  serial: string | null;
  precio: number | null;
}

export interface DispatchDetail {
  rowId: number;
  requestDetailId: number;
  idProducto: number;
  nombre: string;
  cantSolicitada: number;
  cantidad: number;
  marca: string;
  modelo: string;
  condicion: string;
  serial: string;
  precio: number;
  idTipoAlmcacen: number;
  warehouseName: string;
  idEntradaDetalle: number;
  subTotal: number;
}

export interface CreateOutputDto {
  idSolicitud: number;
  idRecinto: number;
  idTipoArticulo: number;
  idTipoSalida: number;
  noRequerimiento: string;
  solicitante: string;
  solicitanteCargo: string;
  unidadOrganizativa: string;
  observacion: string;
  total: number;
  fechaCreacion: string;
  detalles: {
    idSalida: number;
    idProducto: number;
    marca: string;
    modelo: string;
    serial: string;
    cantSolicitada: number;
    cantidadDespachada: number;
    precio: number;
    subTotal: number;
    idTipoAlmcacen: number;
  }[];
}
