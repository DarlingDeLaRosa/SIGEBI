import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Product } from './product';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { Alert } from '../../../../core/service/alert-service/alert';
import { environment } from '../../../../../environments/environment';

const endpoint = `${environment.apiUrl}/Producto`;
const campusEndpoint = `${environment.apiUrlIntranet}/GenericService/getallrecintos`;
const page = { success: true, data: [], currentPage: 1, cantItem: 10, cantPage: 3, totalItems: 22 };

describe('Product campus filter', () => {
  let fixture: ComponentFixture<Product>;
  let http: HttpTestingController;
  const alert = { error: vi.fn() };
  beforeEach(async () => {
    alert.error.mockClear();
    await TestBed.configureTestingModule({ imports: [Product], providers: [
      provideHttpClient(), provideHttpClientTesting(), { provide: DialogService, useValue: { open: vi.fn() } },
      { provide: Alert, useValue: alert },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Product);
    fixture.detectChanges();
    http.expectOne(req => req.url === endpoint).flush(page);
    http.match(req => req.url !== campusEndpoint).forEach(req => req.flush({ success: true, data: [] }));
  });
  afterEach(() => http.verify());

  function loadCampuses() {
    http.expectOne(campusEndpoint).flush({ success: true, data: [
      { idRecinto: 1, nombre: 'Central' }, { idRecinto: 7, nombre: 'Norte' },
    ] });
  }

  it('searches the campus catalog by name and sends all combined filters using GET', () => {
    loadCampuses();
    const component = fixture.componentInstance;
    component.toggleFilters();
    fixture.detectChanges();
    const campus = fixture.debugElement.queryAll(By.directive(SearchSelect))
      .map(item => item.componentInstance as SearchSelect).find(item => item.placeholder === 'Recinto')!;
    expect(campus.showAll).toBe(true);
    campus.search.emit(' nort ');
    expect(component.facade.filteredCampuses()).toEqual([{ idRecinto: 7, nombre: 'Norte' }]);
    campus.selected.emit({ idRecinto: 7, nombre: 'Norte' });
    component.filterForm.patchValue({ filter: 'Papel', idTipoArticulo: 2, idCatalogo: 3 });
    component.pagination.update(value => ({ ...value, currentPage: 3 }));
    component.applyFilters();
    const req = http.expectOne(request => request.url === endpoint);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('idRecinto')).toBe('7');
    expect(req.request.params.get('filter')).toBe('Papel');
    expect(req.request.params.get('idTipoArticulo')).toBe('2');
    expect(req.request.params.get('idCatalogo')).toBe('3');
    expect(req.request.params.get('page')).toBe('1');
    req.flush(page);
    expect(component.filterForm.dirty).toBe(true);
  });

  it('keeps the applied campus when paging or resizing without applying draft changes', () => {
    loadCampuses();
    const component = fixture.componentInstance;
    component.selectCampus({ idRecinto: 7, nombre: 'Norte' });
    component.applyFilters();
    http.expectOne(req => req.url === endpoint).flush(page);
    component.selectCampus({ idRecinto: 1, nombre: 'Central' });
    component.changePage(2);
    const next = http.expectOne(req => req.url === endpoint);
    expect(next.request.params.get('idRecinto')).toBe('7');
    expect(next.request.params.get('page')).toBe('2');
    next.flush({ ...page, currentPage: 2 });
    component.changePageSize(5);
    const resized = http.expectOne(req => req.url === endpoint);
    expect(resized.request.params.get('idRecinto')).toBe('7');
    expect(resized.request.params.get('CantItems')).toBe('5');
    expect(resized.request.params.get('page')).toBe('1');
    resized.flush({ ...page, cantItem: 5 });
  });

  it('supports Todos and clears filters with a single GET without resetting the product form', () => {
    loadCampuses();
    const component = fixture.componentInstance;
    component.selectCampus({ idRecinto: 7, nombre: 'Norte' });
    component.selectCampus(null);
    component.applyFilters();
    const all = http.expectOne(req => req.url === endpoint);
    expect(all.request.params.has('idRecinto')).toBe(false);
    all.flush(page);
    component.selectCampus({ idRecinto: 7, nombre: 'Norte' });
    component.productForm.controls.nombre.setValue('Producto en edición');
    component.clearFilters();
    const clear = http.expectOne(req => req.url === endpoint);
    expect(clear.request.params.has('idRecinto')).toBe(false);
    expect(clear.request.params.get('page')).toBe('1');
    clear.flush(page);
    expect(component.filterForm.pristine).toBe(true);
    expect(component.facade.filterSelections.campus()).toBeNull();
    expect(component.productForm.controls.nombre.value).toBe('Producto en edición');
  });

  it('uses the standard alert if the campus catalog fails', () => {
    http.expectOne(campusEndpoint).flush('Error', { status: 500, statusText: 'Server error' });
    expect(alert.error).toHaveBeenCalledExactlyOnceWith('No se pudieron cargar los recintos');
    expect(fixture.componentInstance.facade.campuses()).toEqual([]);
  });
});
