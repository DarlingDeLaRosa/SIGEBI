import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OutputService } from './output-service';
import { environment } from '../../../../environments/environment';

const endpoint = `${environment.apiUrl}/Salida`;

describe('OutputService', () => {
  let service: OutputService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(OutputService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses GET with the documented query names and preserves requested pagination', () => {
    let result: any;
    service.getAll({ page: 2, CantItems: 5, idRecinto: 7 }).subscribe(value => result = value);
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().sort()).toEqual(['CantItems', 'idRecinto', 'page']);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('CantItems')).toBe('5');
    expect(req.request.params.get('idRecinto')).toBe('7');
    req.flush({ success: true, data: [{ idSalida: 9 }], currentPage: 1, cantItem: 1, cantPage: 2, totalItems: null });
    expect(result.currentPage).toBe(2);
    expect(result.cantItem).toBe(5);
    expect(result.data).toEqual([{ idSalida: 9 }]);
  });

  it('handles an empty response with no campus filter', () => {
    let result: any;
    service.getAll().subscribe(value => result = value);
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.params.has('idRecinto')).toBe(false);
    req.flush({ success: true, data: null, currentPage: 0, cantItem: 0, cantPage: 0 });
    expect(result).toMatchObject({ data: [], currentPage: 1, cantItem: 10, cantPage: 1 });
  });

  it('propagates API failures instead of displaying them as an empty successful page', () => {
    let error: Error | undefined;
    service.getAll().subscribe({ error: value => error = value });
    http.expectOne(request => request.url === endpoint).flush({ success: false, message: 'Consulta fallida', data: null });
    expect(error?.message).toBe('Consulta fallida');
  });
});
