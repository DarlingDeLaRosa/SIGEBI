import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryAdjustmentService } from './inventory-adjustment-service';
import { InventoryAdjustmentMapper } from '../mappers/inventory-adjustment-mapper';
import { environment } from '../../../../environments/environment';

describe('InventoryAdjustmentService', () => {
  let service: InventoryAdjustmentService;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/AjusteInventario`;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InventoryAdjustmentService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends pagination in the query and only Swagger filters in the POST body', () => {
    const filters = { idRecinto: 1, idTipoAlmacen: 2, numeroTomaFisica: 'TF', idProducto: null };
    service.searchAdjustments(filters, 3, 20).subscribe();
    const request = http.expectOne(`${endpoint}/get_filter?page=3&CantItems=20`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(filters);
    request.flush({ success: true, data: [], currentPage: 3, cantItem: 20, cantPage: 3 });
  });

  it('uses POST for creation and PUT with the header id for editing', () => {
    const header = {
      id: 0,
      campusId: 1,
      warehouseId: 2,
      countNumber: 'TF',
      date: '2026-09-07',
      startTime: '',
      endTime: '',
    };
    service.saveAdjustment(InventoryAdjustmentMapper.toSaveDto(header, [], [])).subscribe();
    const create = http.expectOne(endpoint);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).not.toHaveProperty('id');
    create.flush({ success: true, data: {} });
    service
      .saveAdjustment(InventoryAdjustmentMapper.toSaveDto({ ...header, id: 5 }, [], []))
      .subscribe();
    const update = http.expectOne(endpoint);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body.id).toBe(5);
    update.flush({ success: true, data: {} });
  });

  it('rejects a business error even when the HTTP status is successful', () => {
    const error = vi.fn();
    const body = InventoryAdjustmentMapper.toSaveDto(
      {
        id: 0,
        campusId: 1,
        warehouseId: 1,
        countNumber: 'TF',
        date: '2026-09-07',
        startTime: '',
        endTime: '',
      },
      [],
      [],
    );
    service.saveAdjustment(body).subscribe({ error });
    http.expectOne(endpoint).flush({ success: false, message: 'No permitido', data: null });
    expect(error).toHaveBeenCalledOnce();
  });
});
