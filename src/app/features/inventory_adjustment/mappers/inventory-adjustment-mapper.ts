import {
  ApiTimeSpan,
  CreateInventoryAdjustmentDto,
  InventoryAdjustmentDto,
  InventoryAdjustmentFilterDto,
  UpdateInventoryAdjustmentDto,
} from '../DTOs/inventory-adjustment-dto';
import {
  InventoryAdjustmentDetail,
  InventoryAdjustmentModel,
  InventoryAdjustmentParticipant,
} from '../model/inventory-adjustment-model';

export class InventoryAdjustmentMapper {
  static toSaveDto(
    header: {
      id: number;
      campusId: number;
      warehouseId: number;
      countNumber: string;
      date: string;
      startTime: string;
      endTime: string;
    },
    participants: InventoryAdjustmentParticipant[],
    details: InventoryAdjustmentDetail[],
  ): CreateInventoryAdjustmentDto | UpdateInventoryAdjustmentDto {
    const body: CreateInventoryAdjustmentDto = {
      idRecinto: header.campusId,
      tomaFisicaNo: header.countNumber.trim(),
      idTipoAlmacen: header.warehouseId,
      fecha: `${header.date}T00:00:00`,
      horaInicio: this.timeToApi(header.startTime),
      horaTermino: this.timeToApi(header.endTime),
      participantes: participants.map((item) => ({
        nombre: item.name.trim(),
        cargo: item.position.trim(),
      })),
      detalles: details.map((item) => ({
        idProducto: item.productId,
        cantidadConteo: item.countedQuantity,
        existenciaInventario: item.inventoryQuantity,
        observaciones: item.observations.trim() || null,
        idEntradaDetalle: item.entryDetailId,
        idTipoAlmacen: item.warehouseId,
      })),
    };
    return header.id > 0 ? { ...body, id: header.id } : body;
  }

  private static timeToApi(value: string): string | null {
    return value ? (value.length === 5 ? `${value}:00` : value) : null;
  }

  static filters(value: {
    campusId: number | null;
    warehouseId: number | null;
    countNumber: string;
    productId: number | null;
  }): InventoryAdjustmentFilterDto {
    return {
      idRecinto: value.campusId || null,
      idTipoAlmacen: value.warehouseId || null,
      numeroTomaFisica: value.countNumber.trim() || null,
      idProducto: value.productId || null,
    };
  }

  static timeFromApi(value: ApiTimeSpan | string | null): string {
    if (!value) return '';
    if (typeof value === 'string') return value.split('.')[0];
    const seconds = Math.floor(value.ticks / 10000000);
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
      .map((part) => String(part).padStart(2, '0'))
      .join(':');
  }

  static fromApi(value: InventoryAdjustmentDto): InventoryAdjustmentModel {
    return {
      id: value.id,
      campusId: value.idRecinto,
      countNumber: value.tomaFisicaNo ?? '',
      warehouseId: value.idTipoAlmacen,
      warehouseName: value.tipoAlmacenObj?.nombre ?? '',
      date: value.fecha ?? '',
      startTime: this.timeFromApi(value.horaInicio),
      endTime: this.timeFromApi(value.horaTermino),
      participants: (value.participantes ?? []).map((item) => ({
        name: item.nombre ?? '',
        position: item.cargo ?? '',
      })),
      details: (value.detalles ?? []).map((item) => ({
        productId: item.idProducto ?? 0,
        productName: item.productoObj?.nombre ?? '',
        countedQuantity: item.cantidadConteo,
        inventoryQuantity: item.existenciaInventario,
        observations: item.observaciones ?? '',
        entryDetailId: item.idEntradaDetalle,
        warehouseId:
          item.idTipoAlmacen ?? item.tipooAlmacenObj?.idTipoAlm ?? value.idTipoAlmacen ?? 0,
        warehouseName: item.tipooAlmacenObj?.nombre ?? '',
        difference: item.cantidadConteo - item.existenciaInventario,
      })),
    };
  }
}
