import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestFormFacade } from './request-management-facade';
import { RequestForms } from '../forms/request-form';
import { RequestsService } from '../services/requests-service';
import { ProductService } from '../../products/services/product/product-service';
import { ProductTypeService } from '../../maintenance/services/productType/product-type-service';
import { IntranetService } from '../../../shared/service/general.service';
import { Alert } from '../../../core/service/alert-service/alert';

// All requests are mocked: these tests never create requests in SIGEBI.
describe('RequestFormFacade', () => {
  let facade: RequestFormFacade;
  let form: ReturnType<typeof RequestForms.createForm>;
  let detail: ReturnType<typeof RequestForms.createDetailForm>;
  const product = { idProducto: 1, nombre: 'Papel', stock: 2 };
  const person = { idPersona: 1, nombreCompleto: 'Ana Pérez', cargo: { nombre: 'Analista' }, unidadOrganizativa: 'Compras' };
  const products = { getAll: vi.fn(), getById: vi.fn() };
  const requests = { getRequestTypes: vi.fn(), create: vi.fn() };
  const intranet = { getAllRecinto: vi.fn(), filterPeople: vi.fn() };
  const articleTypes = { getAll: vi.fn() };
  const alert = { error: vi.fn(), success: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    products.getAll.mockReturnValue(of({ data: [product] }));
    products.getById.mockReturnValue(of({ data: product }));
    requests.getRequestTypes.mockReturnValue(of({ success: true, data: [{ id: 3, nombre: 'Solicitud' }] }));
    requests.create.mockReturnValue(of({ success: true }));
    intranet.getAllRecinto.mockReturnValue(of({ data: [{ idRecinto: 1, nombre: 'Recinto' }] }));
    articleTypes.getAll.mockReturnValue(of({ data: [{ idTipoArt: 2, nombre: 'Materiales' }] }));
    TestBed.configureTestingModule({ providers: [RequestFormFacade,
      { provide: ProductService, useValue: products }, { provide: RequestsService, useValue: requests },
      { provide: IntranetService, useValue: intranet }, { provide: ProductTypeService, useValue: articleTypes },
      { provide: Alert, useValue: alert },
    ] });
    facade = TestBed.inject(RequestFormFacade);
    form = RequestForms.createForm(new FormBuilder());
    detail = RequestForms.createDetailForm(new FormBuilder());
  });

  it('loads all initial catalogs and products', () => {
    facade.loadSelections();
    expect(facade.tipoArticulo()[0].idTipoArt).toBe(2);
    expect(facade.tipoSolicitud()[0].id).toBe(3);
    expect(facade.recinto()).toHaveLength(1);
    expect(products.getAll).toHaveBeenCalledWith({ filter: '', page: 1, CantItems: 10 });
  });

  it('ignores obsolete product responses and handles lookup errors', () => {
    const old = new Subject<any>();
    products.getAll.mockReturnValueOnce(old).mockReturnValueOnce(of({ data: [product] }));
    facade.loadProducts('anterior');
    facade.loadProducts('papel');
    old.next({ data: [{ idProducto: 99 }] });
    expect(facade.products()).toEqual([product]);
    products.getAll.mockReturnValueOnce(throwError(() => new Error()));
    facade.loadProducts('error');
    expect(facade.products()).toEqual([]);
    expect(facade.loadingProducts()).toBe(false);
    expect(alert.error).toHaveBeenCalled();
  });

  it('requires positive stock and a positive finite quantity, but allows more than stock', () => {
    for (const stock of [0, -1, undefined, NaN]) {
      facade.selectProduct({ ...product, stock }, detail);
      expect(detail.controls.idProducto.value).toBe(0);
    }
    facade.selectProduct(product, detail);
    for (const quantity of [0, -1, NaN, Infinity, null]) {
      detail.patchValue({ cantidadSolicitada: quantity as any });
      facade.addDetail(detail);
      expect(facade.details()).toHaveLength(0);
    }
    detail.patchValue({ cantidadSolicitada: 10 });
    facade.addDetail(detail);
    expect(facade.details()[0].cantidadSolicitada).toBe(10);
    expect(detail.controls.idProducto.value).toBe(0);
    facade.selectProduct(product, detail);
    detail.patchValue({ cantidadSolicitada: 1 });
    facade.addDetail(detail);
    expect(facade.details()).toHaveLength(1);
    expect(alert.error).toHaveBeenLastCalledWith('Este producto ya está en el listado. Edita la fila existente');
  });

  it('preserves a row while editing and checks current stock', () => {
    const row = { idProducto: 1, nombreProducto: 'Papel', cantidadSolicitada: 3 };
    facade.details.set([row]);
    facade.editDetail({ row, index: 0 }, detail);
    facade.clearDetailForm(detail);
    expect(facade.details()).toEqual([row]);
    facade.editDetail({ row, index: 0 }, detail);
    detail.patchValue({ cantidadSolicitada: 5 });
    facade.addDetail(detail);
    expect(facade.details()).toEqual([{ ...row, cantidadSolicitada: 5 }]);
    products.getById.mockReturnValueOnce(of({ data: { ...product, stock: 0 } }));
    facade.editDetail({ row, index: 0 }, detail);
    expect(facade.editingIndex()).toBeNull();
  });

  it('searches people only with a filter and clears dependent fields when typing', () => {
    facade.loadPeople(' ');
    expect(intranet.filterPeople).not.toHaveBeenCalled();
    intranet.filterPeople.mockReturnValue(of({ status: true, data: [{ ...person, nombre: 'Ana', apellidos: 'Pérez' }] }));
    facade.loadPeople('Ana');
    facade.selectPerson(facade.people()[0], form);
    expect(form.controls.solicitante.value).toBe('Ana Pérez');
    expect(form.controls.cargoSolicitante.value).toBe('Analista');
    facade.personSearchChanged(form);
    expect(form.controls.unidadOrganizativa.value).toBe('');
    facade.selectPerson({ ...person, cargo: null }, form);
    expect(facade.formSelections.solicitante()).toBeNull();
  });

  it('preserves form data on failure and sends the existing DTO on success', () => {
    form.patchValue({ idRecinto: 1, idTipoArticulo: 2, idTipoSolicitud: 3 });
    facade.selectPerson(person, form);
    facade.selectProduct(product, detail);
    detail.patchValue({ cantidadSolicitada: 4 });
    facade.addDetail(detail);
    requests.create.mockReturnValueOnce(throwError(() => new Error()));
    facade.create(form);
    expect(facade.details()).toHaveLength(1);
    expect(form.controls.solicitante.value).toBe('Ana Pérez');
    expect(facade.loading()).toBe(false);
    facade.create(form);
    expect(requests.create).toHaveBeenLastCalledWith({ idRecinto: 1, idTipoArticulo: 2,
      idTipoSolicitud: 3, solicitante: 'Ana Pérez', cargoSolicitante: 'Analista', unidadOrganizativa: 'Compras',
      observaciones: '', detalles: [{ idProducto: 1, cantidadSolicitada: 4 }] });
    expect(facade.details()).toEqual([]);
    expect(form.controls.idRecinto.value).toBe(0);
  });

  it('distinguishes intranet connection failures from authorization failures', () => {
    intranet.getAllRecinto.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    facade.loadRecintos();
    expect(alert.error).toHaveBeenLastCalledWith(expect.stringContaining('conectar con la intranet'));
    intranet.getAllRecinto.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })));
    facade.loadRecintos();
    expect(alert.error).toHaveBeenLastCalledWith(expect.stringContaining('rechazó la autorización'));
  });
});
