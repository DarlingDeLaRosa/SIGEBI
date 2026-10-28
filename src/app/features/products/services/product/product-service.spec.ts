import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProductService } from './product-service';
import { environment } from '../../../../../environments/environment';

describe('ProductService filters', () => {
  let service: ProductService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('adds idRecinto to the GET query while retaining the other filters', () => {
    service.getAll({ page: 2, CantItems: 5, filter: 'Papel', idTipoArticulo: 2, idCatalogo: 3, idRecinto: 7 }).subscribe();
    const req = http.expectOne(request => request.url === `${environment.apiUrl}/Producto`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('idRecinto')).toBe('7');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('CantItems')).toBe('5');
    expect(req.request.params.get('filter')).toBe('Papel');
    req.flush({ success: true, data: [] });
  });

  it('omits a null campus instead of sending null or zero', () => {
    service.getAll({ page: 1, CantItems: 10, idRecinto: null }).subscribe();
    const req = http.expectOne(request => request.url === `${environment.apiUrl}/Producto`);
    expect(req.request.params.has('idRecinto')).toBe(false);
    req.flush({ success: true, data: [] });
  });
});
