export interface SupplierDto {
  idProveedor: number;
  rnc: string;
  razonSocial: string;
  nombreComercial: string;
  estadoProveedor: any | null;
  representante: string;
  telRepresentante: string;
}

export interface RecintoDto {
  idRecinto: number;
  nombre: string;
} 

export interface EntryTypeDto {
  idTipoEntrada: number;
  nombre: string;
  descripcion: string;
}

export interface DeliveryTypeDto {
  idTipoEntrega: number;
  nombre: string;
  descripcion: string;
  creador: any | null;
}