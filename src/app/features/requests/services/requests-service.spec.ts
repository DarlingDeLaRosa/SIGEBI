import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RequestsService } from './requests-service';
import { environment } from '../../../../environments/environment';
import { CreateRequestDto } from '../DTOs/request-form-dto';

const endpoint = `${environment.apiUrl}/Solicitudes`;

describe('RequestsService', () => {
  let service: RequestsService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RequestsService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('creates through create_solicitud without pagination parameters', () => {
    const body: CreateRequestDto = { idRecinto: 1, idTipoArticulo: 2, idTipoSolicitud: 3,
      solicitante: 'Ana', cargoSolicitante: 'Analista', unidadOrganizativa: 'Compras',
      observaciones: '', detalles: [{ idProducto: 4, cantidadSolicitada: 5 }] };
    service.create(body).subscribe();
    const req = http.expectOne(`${endpoint}/create_solicitud`);
    expect(req.request.method).toBe('POST');
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toEqual(body);
    expect(req.request.body).not.toHaveProperty('CantItems');
    expect(req.request.body).not.toHaveProperty('cantItems');
    req.flush({ success: true });
  });

  it('lists through POST with a single uppercase CantItems field and no query string', () => {
    let result: any;
    service.getAll({ page: 2, CantItems: 5, filter: 'REQ-1', estado: 3 })
      .subscribe(value => result = value);
    const req = http.expectOne(endpoint);
    expect(req.request.method).toBe('POST');
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toMatchObject({ page: 2, CantItems: 5, noRequerimiento: 'REQ-1', idEstadoSolicitud: 3 });
    expect(Object.keys(req.request.body).filter(key => key.toLowerCase().startsWith('cantitem'))).toEqual(['CantItems']);
    req.flush({ success: true, data: [], currentPage: 1, cantPage: 3, cantItem: 5, totalItems: 12 });
    expect(result.currentPage).toBe(2);
    expect(result.cantItem).toBe(5);
  });

  it('normalizes an empty server result without resetting the page to zero', () => {
    let result: any;
    service.getAll().subscribe(value => result = value);
    http.expectOne(endpoint).flush({ success: true, data: null, currentPage: 0, cantPage: 0, totalItems: 0 });
    expect(result).toMatchObject({ currentPage: 1, cantPage: 1, cantItem: 10, data: [] });
  });
});
