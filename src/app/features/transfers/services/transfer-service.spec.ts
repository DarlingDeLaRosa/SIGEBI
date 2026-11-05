import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { TransferService } from './transfer-service';

const endpoint = `${environment.apiUrl}/Salida/gettrasferencias`;
const empty = { success: true, data: [], currentPage: 0, cantItem: 0, cantPage: 0, totalItems: null };

describe('TransferService', () => {
  let service: TransferService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TransferService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses GET without query parameters when filters are empty', () => {
    const next = vi.fn();
    service.getAll({ CreadoPor: ' ', Estado: null, Desde: null, Hasta: '', page: 1, CantItems: 10 }).subscribe(next);
    const request = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys().sort()).toEqual([]);
    expect(request.request.params.get('CreadoPor')).toBeNull();
    expect(request.request.params.get('Estado')).toBeNull();
    expect(request.request.body).toBeNull();
    request.flush(empty);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ data: [], currentPage: 1, cantItem: 10, cantPage: 1, totalItems: 0 }));
  });

  it('sends all filters with exact query casing and leaves pagination only in the path', () => {
    service.getAll({ CreadoPor: '  Área & almacén  ', Estado: ' Pendiente ', Desde: '2026-11-01T00:00:00',
      Hasta: '2026-11-04T23:59:59.999', page: 2, CantItems: 20 }).subscribe();
    const request = http.expectOne(req => req.url === `${endpoint}/2/20`);
    expect(request.request.params.keys().sort()).toEqual(['CreadoPor', 'Desde', 'Estado', 'Hasta']);
    expect(request.request.params.get('CreadoPor')).toBe('Área & almacén');
    expect(request.request.params.get('Estado')).toBe('Pendiente');
    expect(request.request.params.get('Desde')).toBe('2026-11-01T00:00:00');
    expect(request.request.params.get('Hasta')).toBe('2026-11-04T23:59:59.999');
    expect(request.request.urlWithParams).toContain('%26');
    request.flush({ ...empty, currentPage: 2, cantItem: 1, cantPage: 2 });
  });

  it('supports either date individually and uses null for the other text filter', () => {
    service.getAll({ CreadoPor: 'Ana', Desde: '2026-11-01T00:00:00' }).subscribe();
    const from = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(from.request.params.has('Hasta')).toBe(false);
    expect(from.request.params.get('Estado')).toBeNull();
    from.flush(empty);
    service.getAll({ Estado: 'Pendiente', Hasta: '2026-11-04T23:59:59.999' }).subscribe();
    const to = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(to.request.params.has('Desde')).toBe(false);
    expect(to.request.params.get('CreadoPor')).toBeNull();
    to.flush(empty);
  });

  it('preserves mapping, requested page size and unknown totals', () => {
    let result: any;
    service.getAll({ page: 2, CantItems: 20 }).subscribe(value => result = value);
    http.expectOne(req => req.url === `${endpoint}/2/20`).flush({ ...empty, currentPage: 2, cantItem: 1, cantPage: 2,
      data: [{ id: 1, estado: 'Pendiente', fecha: null, creadoPor: ' Ana Pérez ', verificadoPor: 'Luis Gómez', recinto: null, salida: null }] });
    expect(result).toMatchObject({ currentPage: 2, cantItem: 20, totalItems: null });
    expect(result.data[0]).toMatchObject({ id: 1, status: 'Pendiente', createdBy: 'Ana Pérez', verifiedBy: 'Luis Gómez' });
  });

  it('propagates business failures instead of displaying empty successful results', () => {
    const error = vi.fn();
    service.getAll().subscribe({ error });
    http.expectOne(req => req.url === `${endpoint}/1/10`).flush({ success: false, message: 'No autorizado', data: null });
    expect(error).toHaveBeenCalledOnce();
  });
});
