export interface RequestDetailDto {
  idProducto: number;
  cantidadSolicitada: number;
}

export interface CreateRequestDto {
  idRecinto: number;
  idTipoArticulo: number;
  idTipoSolicitud: number;
  solicitante: string;
  cargoSolicitante: string;
  unidadOrganizativa: string;
  observaciones: string;
  detalles: RequestDetailDto[];
}