export interface IntranetResponse<T> {
  status: boolean | null;
  message: string | null;
  data: T | null;
  currentPage?: number | null;
  totalPage?: number | null;
  totalItem?: number | null;
}

export interface SystemRole {
  idRol: number;
  nombre: string;
  idSistema: number;
}

export interface SystemPerson {
  idUsuario?: number | null;
  idPersona: number;
  nombre: string;
  apellidos: string;
  cedula?: string | null;
  nombreCompleto?: string;
  cargo?: { nombre: string } | null;
  unidadOrganizativa?: string | null;
}

export interface SystemUser {
  idUsuario: number;
  usuario: string;
  idPersona: number;
  persona: SystemPerson | null;
  idRol: number | null;
  rol: SystemRole | null;
  recinto: { nombre: string } | null;
  rowKey?: string;
}

export interface SystemAssignment {
  idUsuario: number;
  idRol: number;
  idSistema: number;
}
