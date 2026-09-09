import { describe, expect, it } from 'vitest';
import { TransferMapper } from './transfer-mapper';
import { TransferDto } from '../DTOs/transfer-dto';

describe('TransferMapper', () => {
  it('keeps the three campus references distinct and maps creator and output data', () => {
    const dto: TransferDto = {
      id: 1,
      fecha: '2026-09-09T08:00:00',
      estado: 'Pendiente',
      recinto: { idRecinto: 2, nombre: 'Transferencia' },
      creadoPor: {
        nombre: ' Ana ',
        apellido: ' Pérez ',
        cargo: 'Encargada',
        recinto: { idRecinto: 1, nombre: 'Creador' },
      },
      verificadoPor: null,
      salida: {
        idSalida: 9,
        recinto: { idRecinto: 3, nombre: 'Salida' },
        departamento: { idDepar: 4, nombre: 'Compras' },
        tipoSalida: { idTipoSalida: 5, nombre: 'Traslado' },
        fechaCreacion: '2026-09-08T08:00:00',
        fechaModif: null,
        observacion: 'Entrega de equipos',
        total: 0,
        isEditable: false,
      },
    };
    expect(TransferMapper.fromApi(dto)).toMatchObject({
      createdBy: 'Ana Pérez',
      creatorCampus: 'Creador',
      outputCampus: 'Salida',
      transferCampus: 'Transferencia',
      department: 'Compras',
      outputId: 9,
      total: 0,
      verifiedBy: '',
    });
  });

  it('tolerates missing related objects without inventing a recipient, creator or total', () => {
    const dto: TransferDto = {
      id: 1,
      fecha: null,
      estado: null,
      recinto: null,
      creadoPor: null,
      verificadoPor: null,
      salida: null,
    };
    expect(TransferMapper.fromApi(dto)).toMatchObject({
      createdBy: '',
      transferCampus: '',
      outputCampus: '',
      total: null,
      date: null,
    });
  });
});
