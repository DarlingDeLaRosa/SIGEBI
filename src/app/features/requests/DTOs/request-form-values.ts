export interface RequestFormValue {
  idRecinto: number;
  idTipoArticulo: number;
  idTipoSolicitud: number;
  solicitante: string;
  cargoSolicitante: string;
  unidadOrganizativa: string;
  observaciones: string;
}

export interface RequestDetailFormValue {
  idProducto: number;
  nombreProducto: string;
  cantidadSolicitada: number;
}