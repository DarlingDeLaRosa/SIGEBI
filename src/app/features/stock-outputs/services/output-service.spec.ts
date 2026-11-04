import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OutputService } from './output-service';
import { environment } from '../../../../environments/environment';

const endpoint = `${environment.apiUrl}/Salida/filter`;
const emptyFilters = { idDepartamento: null, idTipoSalida: null, idRecinto: null, desde: null,
  hasta: null, idSolicitud: null, solicitante: null, noRequerimiento: null };

describe('OutputService', () => {
  let service: OutputService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OutputService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses POST filter with pagination only in the query and preserves the requested page size', () => {
    let result: any;
    service.getAll({ page: 2, CantItems: 5, idRecinto: 7 }).subscribe(value => result = value);
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.params.keys().sort()).toEqual(['CantItems', 'page']);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('CantItems')).toBe('5');
    expect(req.request.body).toEqual({ ...emptyFilters, idRecinto: 7 });
    req.flush({ success: true, data: [{ idSalida: 9 }], currentPage: 1, cantItem: 1, cantPage: 2, totalItems: null });
    expect(result).toMatchObject({ currentPage: 2, cantItem: 5, totalItems: null });
    expect(result.data).toEqual([{ idSalida: 9 }]);
  });

  it('sends all API filters, trimming text without including pagination in the body', () => {
    const filters = { idDepartamento: 1, idTipoSalida: 2, idRecinto: 7, desde: '2026-11-01T00:00:00',
      hasta: '2026-11-04T23:59:59.999', idSolicitud: 11, solicitante: ' Ana ', noRequerimiento: ' REQ-11 ' };
    service.getAll({ page: 1, CantItems: 10, ...filters }).subscribe();
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.body).toEqual({ ...filters, solicitante: 'Ana', noRequerimiento: 'REQ-11' });
    expect(req.request.body).not.toHaveProperty('page');
    expect(req.request.body).not.toHaveProperty('CantItems');
    req.flush({ success: true, data: [] });
  });

  it('normalizes blank filters and empty responses without inventing a total', () => {
    let result: any;
    service.getAll({ solicitante: ' ', noRequerimiento: '' }).subscribe(value => result = value);
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.body).toEqual(emptyFilters);
    req.flush({ success: true, data: null, currentPage: 0, cantItem: 0, cantPage: 0 });
    expect(result).toMatchObject({ data: [], currentPage: 1, cantItem: 10, cantPage: 1, totalItems: null });
  });

  it('propagates API failures rather than treating them as an empty successful page', () => {
    let error: Error | undefined;
    service.getAll().subscribe({ error: value => error = value });
    http.expectOne(request => request.url === endpoint).flush({ success: false, message: 'Consulta fallida', data: null });
    expect(error?.message).toBe('Consulta fallida');
  });
});
