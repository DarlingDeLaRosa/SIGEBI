import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryAdjustment } from './inventory-adjustment';
import { By } from '@angular/platform-browser';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { environment } from '../../../../../environments/environment';
import { Alert } from '../../../../core/service/alert-service/alert';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';

describe('InventoryAdjustment', () => {
  const alert = { error: vi.fn() };
  beforeEach(() => alert.error.mockClear());
  async function setupWithAdjustment() {
    await TestBed.configureTestingModule({
      imports: [InventoryAdjustment],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: Alert, useValue: alert }],
    }).compileComponents();
    const fixture = TestBed.createComponent(InventoryAdjustment);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const campusRequest = http.expectOne(`${environment.apiUrlIntranet}/GenericService/getallrecintos`);
    const requests = http.match(() => true);
    for (const request of requests) {
      request.flush({ success: true, data: request.request.url.endsWith('/get_filter') ? [{
        id: 13, idRecinto: 1, tomaFisicaNo: 'TF-2026-0001', idTipoAlmacen: 2,
        tipoAlmacenObj: { idTipoAlm: 2, nombre: 'Almacén de prueba' }, fecha: '2026-09-04T00:00:00',
        horaInicio: '10:00:00', horaTermino: '13:00:00', participantes: [], detalles: [],
      }] : [], currentPage: 1, cantPage: 1, cantItem: 10, totalItems: null });
    }
    return { fixture, http, campusRequest };
  }

  it('renders each column correctly and updates the campus name when its catalog arrives', async () => {
    const { fixture, http, campusRequest } = await setupWithAdjustment();
    expect(fixture.componentInstance.rows()[0].campusName).toBe('No disponible');
    campusRequest.flush({ success: true, data: [{ idRecinto: 1, nombre: 'Recinto de prueba' }] });
    fixture.detectChanges();
    expect(fixture.componentInstance.references.campuses()).toEqual(fixture.componentInstance.references.recintos());
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    const row = table.tableData()[0];
    expect(table.tableColumns().filter(column => column.key !== 'acciones').map(column => table.formatValue(row, column)))
      .toEqual(['TF-2026-0001', '04/09/2026', 'Recinto de prueba', 'Almacén de prueba', '10:00:00', '13:00:00']);
    expect(fixture.nativeElement.textContent).toContain('Recinto de prueba');
    http.verify();
  });

  it('shows an unavailable name and a visible error when the campus catalog fails', async () => {
    const { fixture, http, campusRequest } = await setupWithAdjustment();
    campusRequest.flush('Error', { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    expect(fixture.componentInstance.rows()[0].campusName).toBe('No disponible');
    expect(alert.error).toHaveBeenCalledWith('No se pudieron cargar los recintos.');
    fixture.detectChanges();
    expect(alert.error).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    http.verify();
  });

  it('renders pagination without inventing a total when the API returns null', async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAdjustment],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: Alert, useValue: alert }],
    }).compileComponents();
    const fixture = TestBed.createComponent(InventoryAdjustment);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    for (const request of http.match(() => true)) {
      request.flush({
        success: true,
        data: [],
        currentPage: 1,
        cantPage: 3,
        cantItem: 10,
        totalItems: null,
      });
    }
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Listado de conciliaciones');
    expect(element.textContent).toContain('Página 1 de 3');
    expect(element.textContent).not.toContain('Total:');
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    expect(table.showPagination()).toBe(true);
    expect(table.showTotal()).toBe(false);
    expect(element.querySelector('nav')).toBeNull();
    http.verify();
  });

  it('loads filter catalogs only on first opening and keeps the title during loading', async () => {
    const { fixture, http, campusRequest } = await setupWithAdjustment();
    campusRequest.flush({ success: true, data: [] });
    const component = fixture.componentInstance;
    http.expectNone(req => req.url.endsWith('/TipoAlmacen') || req.url.endsWith('/Producto'));
    component.toggleFilters();
    const catalogs = http.match(() => true);
    expect(catalogs).toHaveLength(2);
    catalogs.forEach(req => req.flush({ success: true, data: [] }));
    component.toggleFilters();
    component.toggleFilters();
    http.expectNone(() => true);
    component.facade.loadData();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Listado de conciliaciones');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando conciliaciones');
    http.expectOne(req => req.url.endsWith('/get_filter')).flush({ success: true, data: [] });
    http.verify();
  });

  it('applies the selected campus, preserves filters when paging and clears with one POST', async () => {
    const { fixture, http, campusRequest } = await setupWithAdjustment();
    campusRequest.flush({ success: true, data: [{ idRecinto: 1, nombre: 'Central' }, { idRecinto: 2, nombre: 'Norte' }] });
    const component = fixture.componentInstance;
    component.toggleFilters();
    http.match(() => true).forEach(req => req.flush({ success: true, data: [] }));
    fixture.detectChanges();
    const campus = fixture.debugElement.queryAll(By.directive(SearchSelect))
      .map(item => item.componentInstance as SearchSelect).find(item => item.placeholder === 'Recinto')!;
    campus.search.emit('norte');
    expect(component.filteredCampuses()).toEqual([{ idRecinto: 2, nombre: 'Norte' }]);
    campus.selected.emit({ idRecinto: 2, nombre: 'Norte' });
    expect(component.filterForm.dirty).toBe(true);
    expect(component.filterForm.controls.campusId.value).toBe(2);
    component.applyFilters();
    const filtered = http.expectOne(req => req.url.endsWith('/get_filter'));
    expect(filtered.request.body.idRecinto).toBe(2);
    expect(filtered.request.params.get('page')).toBe('1');
    filtered.flush({ success: true, data: [], cantPage: 3, cantItem: 1 });
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    table.pageChange.emit(2);
    const next = http.expectOne(req => req.url.endsWith('/get_filter'));
    expect(next.request.body.idRecinto).toBe(2);
    expect(next.request.params.get('page')).toBe('2');
    expect(next.request.params.get('CantItems')).toBe('10');
    next.flush({ success: true, data: [], cantPage: 3 });
    campus.selected.emit(null);
    expect(component.filterForm.controls.campusId.value).toBeNull();
    component.clearFilters();
    const clear = http.expectOne(req => req.url.endsWith('/get_filter'));
    expect(clear.request.body).toEqual({ idRecinto: null, idTipoAlmacen: null, numeroTomaFisica: null, idProducto: null });
    expect(clear.request.params.get('page')).toBe('1');
    clear.flush({ success: true, data: [] });
    expect(component.filterForm.pristine).toBe(true);
    expect(component.selectedCampus()).toBeNull();
    http.verify();
  });

  it('alerts once per failed catalog request without replacing the loaded list', async () => {
    const { fixture, http, campusRequest } = await setupWithAdjustment();
    campusRequest.flush({ success: true, data: [] });
    fixture.componentInstance.toggleFilters();
    http.match(() => true).forEach(req => req.flush('Error', { status: 500, statusText: 'Server error' }));
    fixture.detectChanges();
    fixture.detectChanges();
    expect(alert.error).toHaveBeenCalledTimes(2);
    expect(alert.error).toHaveBeenCalledWith('No se pudieron cargar los almacenes.');
    expect(alert.error).toHaveBeenCalledWith('No se pudieron cargar los productos.');
    expect(fixture.componentInstance.rows()).toHaveLength(1);
    http.verify();
  });
});
