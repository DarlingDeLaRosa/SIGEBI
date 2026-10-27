export interface OutputModel {
  idSalida: number;
  noRequerimiento: string;
  recinto: { idRecinto: number; nombre: string | null } | null;
  tipoSalida: { idTipoSalida: number; nombre: string | null; descripcion: string | null } | null;
  departamento: { idDepar: number; nombre: string | null } | null;
  creadoPorU: { nombre: string | null; apellido: string | null; cargo: string | null } | null;
  fechaCreacion: string | null;
  fechaModif: string | null;
  solicitante: string | null;
  solicitanteCargo: string | null;
  observacion: string | null;
  total: number | null;
  itbis: number | null;
  totalGeneral: number | null;
  isEditable: boolean | null;
  detalles: OutputProductDetail[] | null;
}

export interface OutputProductDetail {
  idSalidaDet: number;
  producto: { idProducto: number; nombre: string | null; descripcion: string | null } | null;
  cantidad: number | null;
  marca: string | null;
  modelo: string | null;
  condicion: string | null;
  serial: string | null;
  precio: number | null;
  itbis: number | null;
  subTotal: number | null;
  totalGeneral: number | null;
}
