import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Outputs } from './outputs';
import { environment } from '../../../../../environments/environment';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { OutputColumns } from '../../../../shared/constant/table-columns';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { OutputDetail } from '../../dialog/output-detail/output-detail';
import { Alert } from '../../../../core/service/alert-service/alert';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';

const endpoint = `${environment.apiUrl}/Salida/filter`;
const output = { idSalida: 9, noRequerimiento: 'REQ-9', recinto: { idRecinto: 7, nombre: 'Central' },
  tipoSalida: { idTipoSalida: 2, nombre: 'Consumo' }, departamento: { idDepar: 1, nombre: 'Compras' },
  solicitante: 'Persona de prueba', fechaCreacion: '2026-10-20T12:00:00', totalGeneral: 118 };
const page = { success: true, data: [output], currentPage: 1, cantItem: 1, cantPage: 2, totalItems: null };

describe('Outputs', () => {
  let fixture: ComponentFixture<Outputs>;
  let http: HttpTestingController;
  const alert = { error: vi.fn() };
  beforeEach(async () => {
    alert.error.mockClear();
    await TestBed.configureTestingModule({ imports: [Outputs], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]), { provide: Alert, useValue: alert },
      { provide: DialogService, useValue: { open: vi.fn() } },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Outputs);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('opens the output detail with the selected row ID', () => {
    http.expectOne(request => request.url === endpoint).flush(page);
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    table.showDialog.emit(output);
    expect(TestBed.inject(DialogService).open).toHaveBeenCalledWith(OutputDetail, 9);
  });

  it('renders the API fields through OutputColumns, including nested relations', () => {
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.method).toBe('POST');
    req.flush(page);
    fixture.detectChanges();
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    expect(table.tableColumns()).toEqual(OutputColumns);
    expect(table.trackByField()).toBe('idSalida');
    const text = fixture.nativeElement.textContent;
    for (const value of ['REQ-9', 'Central', 'Consumo', 'Compras', 'Persona de prueba', '20/10/2026', '118.00']) {
      expect(text).toContain(value);
    }
    expect(text).toContain('Página 1 de 2');
    expect(text).not.toContain('Código Institucional');
    expect(fixture.nativeElement.querySelectorAll('.tabla-row').length).toBe(1);
  });

  it('uses POST when the table changes page or page size without adopting the server row count', () => {
    http.expectOne(request => request.url === endpoint).flush(page);
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    table.pageChange.emit(2);
    const next = http.expectOne(request => request.url === endpoint);
    expect(next.request.params.get('page')).toBe('2');
    expect(next.request.params.get('CantItems')).toBe('10');
    next.flush(page);
    expect(fixture.componentInstance.pagination().currentPage).toBe(2);
    table.pageSizeChange.emit(5);
    const resized = http.expectOne(request => request.url === endpoint);
    expect(resized.request.params.get('page')).toBe('1');
    expect(resized.request.params.get('CantItems')).toBe('5');
    resized.flush(page);
    expect(fixture.componentInstance.pagination().pageSize).toBe(5);
  });

  it('renders nullable relations and empty data without errors', () => {
    http.expectOne(request => request.url === endpoint).flush({ ...page,
      data: [{ ...output, recinto: null, tipoSalida: null, departamento: null, fechaCreacion: null, totalGeneral: null }] });
    expect(() => fixture.detectChanges()).not.toThrow();
    fixture.componentInstance.loadData();
    http.expectOne(request => request.url === endpoint).flush({ ...page, data: null, cantPage: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se encontraron datos');
  });

  it('passes the row ID from the remove event', () => {
    http.expectOne(request => request.url === endpoint).flush(page);
    const remove = vi.spyOn(fixture.componentInstance, 'remove').mockImplementation(() => {});
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    table.remove.emit({ row: output, index: 0 });
    expect(remove).toHaveBeenCalledWith(9);
    http.expectNone(request => request.method === 'DELETE');
  });

  function openFilters() {
    fixture.componentInstance.toggleFilters();
    http.expectOne(`${environment.apiUrlIntranet}/GenericService/getalldepartamento`)
      .flush({ status: true, data: [{ idDepartamento: 4, nombre: 'Compras' }] });
    http.expectOne(`${environment.apiUrlIntranet}/GenericService/getallrecintos`)
      .flush({ success: true, data: [{ idRecinto: 7, nombre: 'Central' }] });
    http.expectOne(req => req.url === `${environment.apiUrl}/TipoSalida`)
      .flush({ success: true, data: [{ idTipoSalida: 2, nombre: 'Consumo' }] });
    http.expectOne(`${environment.apiUrl}/Solicitudes`)
      .flush({ success: true, data: [{ id: 11, noRequerimiento: 'REQ-11' }], cantPage: 1 });
    fixture.detectChanges();
  }

  it('loads catalogs lazily only once and wires the selectors to real API IDs', () => {
    http.expectOne(req => req.url === endpoint).flush(page);
    openFilters();
    const component = fixture.componentInstance;
    const selectors = fixture.debugElement.queryAll(By.directive(SearchSelect))
      .map(item => item.componentInstance as SearchSelect);
    const find = (placeholder: string) => selectors.find(item => item.placeholder === placeholder)!;
    find('Departamento').search.emit('comp');
    expect(component.facade.filteredDepartments()).toEqual([{ idDepartamento: 4, nombre: 'Compras' }]);
    find('Departamento').selected.emit({ idDepartamento: 4, nombre: 'Compras' });
    find('Tipo de salida').selected.emit({ idTipoSalida: 2, nombre: 'Consumo' });
    find('Recinto').search.emit('central');
    find('Recinto').selected.emit({ idRecinto: 7, nombre: 'Central' });
    find('Solicitud').selected.emit({ id: 11, noRequerimiento: 'REQ-11' });
    expect(component.filterForm.getRawValue()).toMatchObject({ idDepartamento: 4, idTipoSalida: 2, idRecinto: 7, idSolicitud: 11 });
    expect(component.filterForm.dirty).toBe(true);
    component.toggleFilters(); component.toggleFilters();
    http.expectNone(() => true);
    find('Solicitud').search.emit('REQ-2');
    const search = http.expectOne(`${environment.apiUrl}/Solicitudes`);
    expect(search.request.method).toBe('POST');
    expect(search.request.body.noRequerimiento).toBe('REQ-2');
    search.flush({ success: true, data: [] });
  });

  it('applies all filters from page one with inclusive dates and retains them on pagination', () => {
    http.expectOne(req => req.url === endpoint).flush(page);
    const component = fixture.componentInstance;
    component.filterForm.patchValue({ idDepartamento: 4, idTipoSalida: 2, idRecinto: 7, idSolicitud: 11,
      solicitante: ' Ana ', noRequerimiento: ' REQ-11 ', desde: '2026-11-01', hasta: '2026-11-04' });
    component.pagination.update(value => ({ ...value, currentPage: 3 }));
    component.applyFilters();
    const filtered = http.expectOne(req => req.url === endpoint);
    const body = { idDepartamento: 4, idTipoSalida: 2, idRecinto: 7, idSolicitud: 11,
      solicitante: 'Ana', noRequerimiento: 'REQ-11', desde: '2026-11-01T00:00:00', hasta: '2026-11-04T23:59:59.999' };
    expect(filtered.request.body).toEqual(body);
    expect(filtered.request.params.get('page')).toBe('1');
    filtered.flush(page);
    component.filterForm.controls.idRecinto.setValue(99);
    component.changePage(2);
    const next = http.expectOne(req => req.url === endpoint);
    expect(next.request.body).toEqual(body);
    expect(next.request.params.get('page')).toBe('2');
    next.flush(page);
    component.changePageSize(5);
    const resized = http.expectOne(req => req.url === endpoint);
    expect(resized.request.body).toEqual(body);
    expect(resized.request.params.get('page')).toBe('1');
    expect(resized.request.params.get('CantItems')).toBe('5');
    resized.flush(page);
  });

  it('supports Todos and clears fields, selections and search text using exactly one list POST', () => {
    http.expectOne(req => req.url === endpoint).flush(page);
    openFilters();
    const component = fixture.componentInstance;
    component.selectFilter(component.facade.selectedCampus, 'idRecinto', { idRecinto: 7, nombre: 'Central' }, 'idRecinto');
    component.selectFilter(component.facade.selectedCampus, 'idRecinto', null, 'idRecinto');
    expect(component.filterForm.controls.idRecinto.value).toBeNull();
    const selector = fixture.debugElement.query(By.directive(SearchSelect)).componentInstance as SearchSelect;
    selector.searchText.set('Texto pendiente');
    component.filterForm.patchValue({ desde: '2026-11-01', solicitante: 'Ana' });
    component.clearFilters();
    const clear = http.expectOne(req => req.url === endpoint);
    expect(clear.request.body).toEqual({ idDepartamento: null, idTipoSalida: null, idRecinto: null,
      idSolicitud: null, solicitante: null, noRequerimiento: null, desde: null, hasta: null });
    expect(clear.request.params.get('page')).toBe('1');
    clear.flush(page);
    expect(component.filterForm.pristine).toBe(true);
    expect(selector.searchText()).toBe('');
    expect(component.facade.selectedCampus()).toBeNull();
  });

  it('rejects inverted dates without making a request and accepts either date alone', () => {
    http.expectOne(req => req.url === endpoint).flush(page);
    const component = fixture.componentInstance;
    component.filterForm.patchValue({ desde: '2026-11-04', hasta: '2026-11-01' });
    component.applyFilters();
    http.expectNone(() => true);
    expect(alert.error).toHaveBeenCalledOnce();
    component.filterForm.controls.hasta.setValue('');
    component.applyFilters();
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.body).toMatchObject({ desde: '2026-11-04T00:00:00', hasta: null });
    req.flush(page);
  });

  it('cancels stale list requests and reports HTTP or API errors through standard alerts', () => {
    const initial = http.expectOne(req => req.url === endpoint);
    fixture.componentInstance.applyFilters();
    expect(initial.cancelled).toBe(true);
    const latest = http.expectOne(req => req.url === endpoint);
    latest.flush('Error', { status: 500, statusText: 'Server error' });
    expect(alert.error).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.loadingList()).toBe(false);
    fixture.componentInstance.loadData();
    http.expectOne(req => req.url === endpoint).flush({ success: false, data: null, message: 'Failure' });
    expect(alert.error).toHaveBeenCalledTimes(2);
  });

  it('reports catalog failures without removing the current output rows', () => {
    http.expectOne(req => req.url === endpoint).flush(page);
    fixture.componentInstance.toggleFilters();
    const catalogs = http.match(() => true);
    expect(catalogs).toHaveLength(4);
    catalogs.forEach(req => req.flush('Error', { status: 500, statusText: 'Server error' }));
    expect(alert.error).toHaveBeenCalledTimes(4);
    expect(fixture.componentInstance.data()?.data).toEqual([output]);
  });
});
