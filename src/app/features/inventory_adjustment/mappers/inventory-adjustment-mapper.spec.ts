import { describe, expect, it } from 'vitest';
import { InventoryAdjustmentMapper } from './inventory-adjustment-mapper';
import { InventoryAdjustmentDto } from '../DTOs/inventory-adjustment-dto';

describe('InventoryAdjustmentMapper', () => {
  const header = {
    id: 0,
    campusId: 1,
    warehouseId: 2,
    countNumber: ' TF-01 ',
    date: '2026-09-07',
    startTime: '08:00',
    endTime: '10:30',
  };
  const detail = {
    productId: 3,
    productName: 'Papel',
    countedQuantity: 0,
    inventoryQuantity: 10,
    observations: ' Faltante ',
    entryDetailId: 4,
    warehouseId: 2,
    warehouseName: 'Almacén',
    difference: -10,
  };

  it('maps UI fields to the API without sending display fields and preserves zero counts', () => {
    const body = InventoryAdjustmentMapper.toSaveDto(
      header,
      [{ name: ' Ana ', position: ' Encargada ' }],
      [detail],
    );
    expect(body).toEqual({
      idRecinto: 1,
      idTipoAlmacen: 2,
      tomaFisicaNo: 'TF-01',
      fecha: '2026-09-07T00:00:00',
      horaInicio: '08:00:00',
      horaTermino: '10:30:00',
      participantes: [{ nombre: 'Ana', cargo: 'Encargada' }],
      detalles: [
        {
          idProducto: 3,
          cantidadConteo: 0,
          existenciaInventario: 10,
          observaciones: 'Faltante',
          idEntradaDetalle: 4,
          idTipoAlmacen: 2,
        },
      ],
    });
    expect(InventoryAdjustmentMapper.toSaveDto({ ...header, id: 12 }, [], [detail])).toHaveProperty(
      'id',
      12,
    );
  });

  it('uses the warehouse reference when the API returns a null detail warehouse id', () => {
    const dto = {
      ...InventoryAdjustmentMapper.toSaveDto(header, [], [detail]),
      id: 12,
    } as InventoryAdjustmentDto;
    dto.detalles[0].idTipoAlmacen = null;
    dto.detalles[0].tipooAlmacenObj = { idTipoAlm: 2, nombre: 'Almacén' };
    const result = InventoryAdjustmentMapper.fromApi(dto);
    expect(result.details[0].warehouseId).toBe(2);
    expect(result.details[0].difference).toBe(-10);
    expect(result.startTime).toBe('08:00:00');
  });

  it('maps only supported filter keys and normalizes empty values', () => {
    expect(
      InventoryAdjustmentMapper.filters({
        campusId: null,
        warehouseId: 0,
        countNumber: ' ',
        productId: 3,
      }),
    ).toEqual({ idRecinto: null, idTipoAlmacen: null, numeroTomaFisica: null, idProducto: 3 });
  });
});
