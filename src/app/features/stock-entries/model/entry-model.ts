import { DeliveryTypeDto, EntryTypeDto, RecintoDto, SupplierDto } from "../../maintenance/DTO/maintenance";
import { ProductModel } from "../../products/model/productModel";

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