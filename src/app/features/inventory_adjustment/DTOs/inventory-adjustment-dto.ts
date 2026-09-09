export interface InventoryAdjustmentFilterDto {
  idRecinto: number | null;
  idTipoAlmacen: number | null;
  numeroTomaFisica: string | null;
  idProducto: number | null;
}

export interface InventoryAdjustmentParticipantDto {
  nombre: string | null;
  cargo: string | null;
}

export interface InventoryAdjustmentDetailDto {
  idProducto: number | null;
  cantidadConteo: number;
  existenciaInventario: number;
  observaciones: string | null;
  idEntradaDetalle: number;
  idTipoAlmacen: number;
}

export interface ApiTimeSpan {
  ticks: number;
}

export interface CreateInventoryAdjustmentDto {
  idRecinto: number | null;
  tomaFisicaNo: string | null;
  idTipoAlmacen: number | null;
  fecha: string | null;
  horaInicio: ApiTimeSpan | string | null;
  horaTermino: ApiTimeSpan | string | null;
  participantes: InventoryAdjustmentParticipantDto[];
  detalles: InventoryAdjustmentDetailDto[];
}

export interface UpdateInventoryAdjustmentDto extends CreateInventoryAdjustmentDto {
  id: number;
}

export interface CampusDto {
  idRecinto: number;
  nombre: string | null;
}

export interface WarehouseDto {
  idTipoAlm: number;
  nombre: string | null;
  idRecinto?: number | null;
}

export interface ProductOptionDto {
  idProducto: number;
  nombre: string | null;
}

export interface InventoryAdjustmentDto extends Omit<CreateInventoryAdjustmentDto, 'detalles'> {
  id: number;
  tipoAlmacenObj?: WarehouseDto | null;
  detalles: (Omit<InventoryAdjustmentDetailDto, 'idTipoAlmacen'> & {
    idTipoAlmacen: number | null;
    productoObj?: ProductOptionDto | null;
    tipooAlmacenObj?: WarehouseDto | null;
  })[];
}

export interface EntryDetailOptionDto {
  idEntradaDet: number;
  idEntrada: number | null;
  producto: ProductOptionDto;
  marca: string | null;
  modelo: string | null;
  serial: string | null;
  cantidad: number | null;
}

export interface InventoryAdjustmentResponse<T> {
  data: T;
  success: boolean;
  message: string;
  currentPage?: number;
  cantItem?: number;
  cantPage?: number;
  totalItems?: number | null;
}
