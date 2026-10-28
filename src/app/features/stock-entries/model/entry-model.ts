import { DeliveryTypeDto, EntryTypeDto, RecintoDto, SupplierDto } from "../../maintenance/DTO/maintenance";
import { ProductModel } from "../../products/model/productModel";

export interface EntryDetailSnapshot {
  idEntradaDet: number;
  idEntrada: number | null;
  producto: { idProducto: number; nombre: string | null; descripcion?: string | null } | null;
  marca: string | null;
  modelo: string | null;
  serial: string | null;
  cantidad: number | null;
  condicion?: string | null;
  precio?: number | null;
  itbisProducto?: number | null;
  subTotal?: number | null;
  observacion?: string | null;
  idTipoAlmacen?: number | null;
}

export interface EntryDetailDialogData {
  detail: EntryDetailSnapshot;
  campusName: string;
  warehouseName: string;
}

export interface StockEntryModel {
  idEntrada: number;
  idRecinto: number;
  idTipoEntrada: number;
  idTipoEntrega: number;

  numOrden: string | null;
  noFactura: string;
  noConduce: string;

  fechaFactura: string;
  fechaCreacion: string;
  fechaModif: string | null;

  itbisGeneral: number;
  itbisGeneralEstado: boolean;
  total: number;

  observacion: string;

  creadoPor: string;
  isEditable: boolean;

  recinto: RecintoDto;
  tipoEntrada: EntryTypeDto;
  tipoEntrega: DeliveryTypeDto;
  proveedor: SupplierDto;

  detalles: StockEntryDetailModel[];
}

export interface StockEntryDetailModel {
  idEntradaDet: number;
  idEntrada: number;

  cantidad: number;
  condicion: string;

  marca: string;
  modelo: string;
  serial: string;

  precio: number;
  itbisProducto: number;
  subTotal: number;

  observacion: string;

  producto: ProductModel;
}
