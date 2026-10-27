import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Requests } from './requests';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { environment } from '../../../../../environments/environment';
import { By } from '@angular/platform-browser';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { RequestDetail } from '../../dialog/request-detail/request-detail';

const endpoint = `${environment.apiUrl}/Solicitudes`;
const page = { success: true, data: [], currentPage: 0, cantItem: 10, cantPage: 2, totalItems: 12 };

describe('Requests', () => {
  let fixture: ComponentFixture<Requests>;
  let http: HttpTestingController;
  let initialRequest: TestRequest;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Requests], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
      { provide: DialogService, useValue: { open: vi.fn() } },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Requests);
    fixture.detectChanges();
    http.expectOne(`${endpoint}/estados`).flush({ success: true, data: [{ id: 2, nombre: 'Aprobada' }] });
    http.expectOne(`${endpoint}/tipo_solicitudes`).flush({ success: true, data: [{ id: 3, nombre: 'Interna' }] });
    http.expectOne(`${environment.apiUrlIntranet}/GenericService/getallrecintos`).flush({ success: true, data: [{ idRecinto: 7, nombre: 'Central' }] });
    http.expectOne(req => req.url === `${environment.apiUrl}/TipoArticulo`).flush({ success: true, data: [{ idTipoArt: 4, nombre: 'Materiales' }] });
    initialRequest = http.expectOne(endpoint);
    initialRequest.flush(page);
  });
  afterEach(() => http.verify());

  it('opens the detail dialog with the ID emitted by the table', () => {
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    table.showDialog.emit({ id: 12 });
    expect(TestBed.inject(DialogService).open).toHaveBeenCalledWith(RequestDetail, 12);
  });

  it('loads using POST with only CantItems and a valid first page', () => {
    expect(initialRequest.request.method).toBe('POST');
    expect(initialRequest.request.params.keys()).toEqual([]);
    expect(initialRequest.request.body.CantItems).toBe(10);
    expect(Object.keys(initialRequest.request.body).filter(key => key.toLowerCase().startsWith('cantitem'))).toEqual(['CantItems']);
    expect(fixture.componentInstance.pagination().currentPage).toBe(1);
    http.expectNone(req => req.method === 'GET' && req.url === endpoint);
  });

  it('retains the form filters when changing page', () => {
    const component = fixture.componentInstance;
    component.filterForm.controls.noRequerimiento.setValue('REQ-1');
    component.applyFilters();
    const filter = http.expectOne(endpoint);
    expect(filter.request.body.noRequerimiento).toBe('REQ-1');
    filter.flush(page);
    component.changePage(2);
    const next = http.expectOne(endpoint);
    expect(next.request.body).toMatchObject({ page: 2, CantItems: 10, noRequerimiento: 'REQ-1' });
    next.flush({ ...page, currentPage: 1 });
    expect(component.pagination().currentPage).toBe(2);
  });

  it('submits every filter from page one and preserves them when resizing the page', () => {
    const component = fixture.componentInstance;
    component.pagination.update(value => ({ ...value, currentPage: 3 }));
    const filters = { noRequerimiento: 'REQ-2', idEstadoSolicitud: 2, idTipoArticulo: 4,
      idTipoSolicitud: 3, unidadOrganizativa: 'Compras', idRecinto: 7 };
    component.filterForm.patchValue(filters);
    component.applyFilters();
    const filtered = http.expectOne(endpoint);
    expect(filtered.request.body).toEqual({ ...filters, page: 1, CantItems: 10 });
    filtered.flush(page);
    component.filterForm.controls.noRequerimiento.setValue('DRAFT');
    component.changePageSize(5);
    const resized = http.expectOne(endpoint);
    expect(resized.request.body).toEqual({ ...filters, page: 1, CantItems: 5 });
    resized.flush(page);
  });

  it('supports Todos and clears selections and filters with a single list POST', () => {
    const component = fixture.componentInstance;
    component.selectFilter(component.facade.filterSelections.status, 'idEstadoSolicitud', { id: 2, nombre: 'Aprobada' }, 'id');
    expect(component.filterForm.controls.idEstadoSolicitud.value).toBe(2);
    component.selectFilter(component.facade.filterSelections.status, 'idEstadoSolicitud', null, 'id');
    expect(component.filterForm.controls.idEstadoSolicitud.value).toBeNull();
    component.filterForm.patchValue({ noRequerimiento: 'REQ-2', idRecinto: 7 });
    component.clearForm();
    http.expectOne(req => req.url === `${environment.apiUrl}/TipoArticulo`).flush({ success: true, data: [] });
    const cleared = http.expectOne(endpoint);
    expect(cleared.request.body).toEqual({ page: 1, CantItems: 10, noRequerimiento: null,
      idEstadoSolicitud: null, idTipoArticulo: null, idTipoSolicitud: null,
      unidadOrganizativa: null, idRecinto: null });
    cleared.flush(page);
    expect(component.facade.filterSelections.status()).toBeNull();
    expect(component.filterForm.pristine).toBe(true);
  });
});
