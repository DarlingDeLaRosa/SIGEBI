export interface RequestModel {
  id: number;
  noRequerimiento: string | null;

  idRecinto: number | null;
  recintoObj: RequestRecinto | null;

  idTipoArticulo: number | null;
  tipoArtiucloObj: RequestTipoArticulo | null;

  idTipoSolicitud: number | null;
  tipoSolicitudObj: RequestTipoSolicitud | null;

  fecha: string | null;

  solicitante: string | null;
  cargoSolicitante: string | null;
  unidadOrganizativa: string | null;

  observaciones: string | null;

  idEstado: number | null;
  estadoObj: RequestEstado | null;

  detallesSolicitud: RequestDetail[] | null;
}

export interface RequestRecinto {
  idRecinto: number;
  nombre: string;
}

export interface RequestTipoArticulo {
  idTipoArt: number;
  nombre: string;
}

export interface RequestTipoSolicitud {
  id: number;
  codigo: string;
  nombre: string;
  vers: string;
  unidadResponsable: string;
  fechaCreacion: string;
  fechaRevision: string;
}

export interface RequestEstado {
  id: number;
  nombre: string;
}

export interface RequestDetail {
  id: number;
  idProducto: number | null;

  productoObj: {
    idProducto: number;
    nombre: string;
    descripcion: string;
    precio: number;
    itbis: number;
  } | null;

  cantidadSolicitada: number | null;
}