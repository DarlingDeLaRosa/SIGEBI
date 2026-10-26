import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UsersService } from './users-service';
import { environment } from '../../../../../environments/environment';
import { SIGEBI_SYSTEM_ID } from '../../../../shared/constant/system';

const api = environment.apiUrlIntranet;

describe('UsersService', () => {
  let service: UsersService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('maps server pagination and uses the intranet system constant', () => {
    let result: any;
    service.getAll({ filter: 'Ana', page: 2, CantItems: 5 }).subscribe(value => result = value);
    const req = http.expectOne(request => request.url === `${api}/User/getusuariossistema/${SIGEBI_SYSTEM_ID}`);
    expect(req.request.params.get('filter')).toBe('Ana');
    expect(req.request.params.get('currentPage')).toBe('2');
    expect(req.request.params.get('totalItem')).toBe('5');
    req.flush({ status: true, data: [{ idUsuario: 40, idRol: 2 }], currentPage: 2, totalPage: 3, totalItem: 13 });
    expect(result).toMatchObject({ currentPage: 2, cantItem: 5, cantPage: 3, totalItems: 13 });
    expect(result.data[0].rowKey).toBe('40-2');
  });

  it('normalizes an empty list to one visible page', () => {
    let result: any;
    service.getAll().subscribe(value => result = value);
    http.expectOne(request => request.url.includes('getusuariossistema/27'))
      .flush({ status: true, data: null, currentPage: 1, totalPage: 0, totalItem: 0 });
    expect(result.data).toEqual([]);
    expect(result.cantPage).toBe(1);
  });

  it('loads roles only from generic service for SIGEBI', () => {
    let result: any;
    service.getRoles().subscribe(value => result = value);
    http.expectOne(`${api}/Rol/getrolesbyidsistema/27`).flush({ status: true, data: [] });
    expect(result).toEqual([]);
  });

  it('uses POST for both membership operations and never deletes the intranet account', () => {
    for (const operation of ['add', 'remove'] as const) {
      const call = operation === 'add' ? service.addToSystem.bind(service) : service.removeFromSystem.bind(service);
      call({ idUsuario: 200, idRol: 4, idSistema: 999 }).subscribe();
      const req = http.expectOne(`${api}/Sistema/${operation}-user-system`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ idUsuario: 200, idRol: 4, idSistema: 27 });
      req.flush({ status: true, data: 'OK' });
    }
  });

  it('rejects HTTP 200 with status false', () => {
    let error: Error | undefined;
    service.addToSystem({ idUsuario: 200, idRol: 4, idSistema: 27 }).subscribe({ error: value => error = value });
    http.expectOne(`${api}/Sistema/add-user-system`).flush({ status: false, message: 'Ya existe' });
    expect(error?.message).toBe('Ya existe');
  });

  it('searches intranet accounts with the documented filter and pagination parameters', () => {
    let result: any;
    service.searchPeople('Ana Pérez', 2, 5).subscribe(value => result = value);
    const req = http.expectOne(request => request.url === api + '/User/getusuariossistema/1');
    expect(req.request.params.get('filter')).toBe('Ana Pérez');
    expect(req.request.params.get('currentPage')).toBe('2');
    expect(req.request.params.get('totalItem')).toBe('5');
    req.flush({ status: true, data: [{ idUsuario: 200, idPersona: 7, usuario: 'ana',
      persona: { idPersona: 7, idUsuario: 999, nombre: 'Ana', apellidos: 'Pérez', unidadOrganizativa: 'Compras' } }] });
    expect(result).toEqual([expect.objectContaining({ idUsuario: 200, idPersona: 7,
      nombreCompleto: 'Ana Pérez', unidadOrganizativa: 'Compras' })]);
  });

  it('returns an empty selector for an empty intranet search', () => {
    let result: any;
    service.searchPeople('Sin resultado').subscribe(value => result = value);
    http.expectOne(request => request.url === api + '/User/getusuariossistema/1')
      .flush({ status: true, data: null });
    expect(result).toEqual([]);
  });
});
