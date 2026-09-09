export interface TransferCampusDto {
  idRecinto: number;
  nombre: string | null;
}

export interface TransferUserDto {
  nombre: string | null;
  apellido: string | null;
  cargo: string | null;
  recinto: TransferCampusDto | null;
}

export interface TransferDto {
  id: number;
  fecha: string | null;
  estado: string | null;
  recinto: TransferCampusDto | null;
  creadoPor: TransferUserDto | null;
  verificadoPor: TransferUserDto | null;
  salida: {
    idSalida: number;
    recinto: TransferCampusDto | null;
    departamento: { idDepar: number; nombre: string | null } | null;
    tipoSalida: { idTipoSalida: number; nombre: string | null } | null;
    fechaCreacion: string | null;
    fechaModif: string | null;
    observacion: string | null;
    total: number | null;
    isEditable: boolean | null;
  } | null;
}

export interface TransferListDto {
  data: TransferDto[] | null;
  success: boolean;
  message: string;
  dateNow: string;
  currentPage: number | null;
  cantItem: number | null;
  cantPage: number | null;
  totalItems: number | null;
}
