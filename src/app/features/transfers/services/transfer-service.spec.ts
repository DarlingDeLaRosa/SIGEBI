import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { TransferService } from './transfer-service';

describe('TransferService', () => {
  let service: TransferService;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/Salida`;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TransferService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses the unfiltered route for empty searches and normalizes the empty API response', () => {
    const next = vi.fn();
    service.getAll({ filter: ' ', page: 1, CantItems: 10 }).subscribe(next);
    const request = http.expectOne(`${endpoint}/gettrasferencias/1/10`);
    expect(request.request.method).toBe('GET');
    request.flush({
      success: true,
      data: [],
      currentPage: 0,
      cantItem: 0,
      cantPage: 0,
      totalItems: null,
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [],
        currentPage: 1,
        cantItem: 10,
        cantPage: 1,
        totalItems: 0,
      }),
    );
  });

  it('encodes the text filter as a single path parameter and preserves pagination', () => {
    service.getAll({ filter: '  Área & almacén  ', page: 2, CantItems: 20 }).subscribe();
    const request = http.expectOne(
      `${endpoint}/gettrasferencias_filter/${encodeURIComponent('Área & almacén')}/2/20`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    request.flush({
      success: true,
      data: [],
      currentPage: 2,
      cantItem: 20,
      cantPage: 2,
      totalItems: null,
    });
  });

  it('propagates business failures so they are not displayed as empty results', () => {
    const error = vi.fn();
    service.getAll().subscribe({ error });
    http
      .expectOne(`${endpoint}/gettrasferencias/1/10`)
      .flush({ success: false, message: 'No autorizado', data: null });
    expect(error).toHaveBeenCalledOnce();
  });
});
