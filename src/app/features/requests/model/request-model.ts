export interface RequestModel {
  id: number;
  noRequerimiento: string;

  idRecinto: number;
  recintoObj: RequestRecinto;

  idTipoArticulo: number;
  tipoArtiucloObj: RequestTipoArticulo;

  idTipoSolicitud: number;
  tipoSolicitudObj: RequestTipoSolicitud;

  fecha: string;

  solicitante: string;
  cargoSolicitante: string;
  unidadOrganizativa: string;

  observaciones: string;

  idEstado: number;
  estadoObj: RequestEstado;

  detallesSolicitud: RequestDetail[];
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
  idProducto: number;

  productoObj: {
    idProducto: number;
    nombre: string;
    descripcion: string;
    precio: number;
    itbis: number;
  };

  cantidadSolicitada: number;
}