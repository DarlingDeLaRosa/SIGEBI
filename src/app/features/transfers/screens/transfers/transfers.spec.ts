import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Transfers } from './transfers';
import { environment } from '../../../../../environments/environment';
import { Alert } from '../../../../core/service/alert-service/alert';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { TransferDetailDialog } from '../../dialog/transfer-detail-dialog/transfer-detail-dialog';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';

const endpoint = `${environment.apiUrl}/Salida/gettrasferencias`;
const response = { success: true, data: [], currentPage: 1, cantItem: 10, cantPage: 1, totalItems: 0 };
const transfer = { id: 1, fecha: null, estado: 'Pendiente', creadoPor: null, verificadoPor: null, salida: null, recinto: null };

describe('Transfers', () => {
  let fixture: ComponentFixture<Transfers>;
  let http: HttpTestingController;
  const alert = { error: vi.fn() };
  const dialog = { open: vi.fn() };
  beforeEach(async () => {
    alert.error.mockClear(); dialog.open.mockClear();
    await TestBed.configureTestingModule({ imports: [Transfers], providers: [
      provideHttpClient(), provideHttpClientTesting(), { provide: Alert, useValue: alert }, { provide: DialogService, useValue: dialog },
    ] }).compileComponents();
    fixture = TestBed.createComponent(Transfers);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const initial = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(initial.request.params.get('CreadoPor')).toBeNull();
    expect(initial.request.params.get('Estado')).toBeNull();
    initial.flush(response);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('retains submitted filters during pagination and clears them with a single GET', () => {
    const component = fixture.componentInstance;
    component.filterForm.setValue({ CreadoPor: ' Ana ', Estado: ' Pendiente ', Desde: '2026-11-01', Hasta: '2026-11-04' });
    component.applyFilters();
    const filtered = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(filtered.request.params.get('CreadoPor')).toBe('Ana');
    expect(filtered.request.params.get('Estado')).toBe('Pendiente');
    expect(filtered.request.params.get('Desde')).toBe('2026-11-01T00:00:00');
    expect(filtered.request.params.get('Hasta')).toBe('2026-11-04T23:59:59.999');
    filtered.flush({ ...response, cantPage: 3 });
    component.filterForm.controls.Estado.setValue('Borrador sin enviar');
    component.changePage(2);
    const next = http.expectOne(req => req.url === `${endpoint}/2/10`);
    expect(next.request.params.toString()).toBe(filtered.request.params.toString());
    next.flush({ ...response, currentPage: 2, cantPage: 3 });
    component.changePageSize(20);
    const resized = http.expectOne(req => req.url === `${endpoint}/1/20`);
    expect(resized.request.params.toString()).toBe(filtered.request.params.toString());
    resized.flush(response);
    component.clearForm();
    const cleared = http.expectOne(req => req.url === `${endpoint}/1/20`);
    expect(cleared.request.params.keys().sort()).toEqual([]);
    expect(cleared.request.params.get('CreadoPor')).toBeNull();
    expect(cleared.request.params.get('Estado')).toBeNull();
    cleared.flush(response);
    expect(component.filterForm.getRawValue()).toEqual({ CreadoPor: null, Estado: null, Desde: null, Hasta: null });
    expect(component.filterForm.pristine).toBe(true);
  });

  it('renders four fields, uses shared form actions and rejects inverted dates', () => {
    const component = fixture.componentInstance;
    component.facade.toggleFilters();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('form input').length).toBe(4);
    const actions = fixture.debugElement.query(By.directive(FormActions)).componentInstance as FormActions;
    expect(actions.editing()).toBe(false);
    expect(actions.disabled()).toBe(true);
    component.filterForm.patchValue({ Desde: '2026-11-04', Hasta: '2026-11-01' });
    component.filterForm.markAsDirty();
    component.applyFilters();
    fixture.detectChanges();
    expect(actions.disabled()).toBe(true);
    expect(alert.error).toHaveBeenCalledOnce();
    http.expectNone(() => true);
    component.filterForm.controls.Hasta.setValue('2026-11-04');
    component.applyFilters();
    const sameDay = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(sameDay.request.params.get('Desde')).toBe('2026-11-04T00:00:00');
    expect(sameDay.request.params.get('Hasta')).toBe('2026-11-04T23:59:59.999');
    sameDay.flush(response);
  });

  it('accepts a single date and turns blank text into null applied filters', () => {
    const component = fixture.componentInstance;
    component.filterForm.patchValue({ CreadoPor: ' ', Hasta: '2026-11-04' });
    component.applyFilters();
    const request = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(request.request.params.has('Desde')).toBe(false);
    expect(request.request.params.get('Hasta')).toBe('2026-11-04T23:59:59.999');
    expect(component.facade.activeFilters().CreadoPor).toBeNull();
    request.flush(response);
  });

  it('shows pagination for unknown totals without exposing edit or delete actions', () => {
    fixture.componentInstance.loadData();
    http.expectOne(req => req.url === `${endpoint}/1/10`).flush({ ...response, cantPage: 2, totalItems: null, data: [transfer] });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Página 1 de 2');
    expect(element.textContent).not.toContain('Total:');
    expect(element.querySelectorAll('.btn-page').length).toBeGreaterThan(0);
    expect(element.querySelector('.item-edit')).toBeNull();
    expect(element.querySelector('.item-delete')).toBeNull();
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    const row = table.tableData()[0];
    table.showDialog.emit(row);
    expect(dialog.open).toHaveBeenCalledWith(TransferDetailDialog, row, '900px');
  });

  it('cancels older requests so stale results cannot replace current filters', () => {
    const component = fixture.componentInstance;
    component.filterForm.controls.CreadoPor.setValue('first'); component.applyFilters();
    const first = http.expectOne(req => req.url === `${endpoint}/1/10`);
    component.filterForm.controls.CreadoPor.setValue('second'); component.applyFilters();
    expect(first.cancelled).toBe(true);
    const second = http.expectOne(req => req.url === `${endpoint}/1/10`);
    expect(second.request.params.get('CreadoPor')).toBe('second');
    second.flush(response);
    expect(component.facade.loading()).toBe(false);
  });

  it('keeps the table title visible during loading and reports failures with standard alerts', () => {
    fixture.componentInstance.loadData();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Listado de transferencias');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando transferencias');
    http.expectOne(req => req.url === `${endpoint}/1/10`).flush('Failure', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(alert.error).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Listado de transferencias');
    fixture.componentInstance.loadData();
    http.expectOne(req => req.url === `${endpoint}/1/10`).flush({ success: false, message: 'No permitido', data: null });
    expect(alert.error).toHaveBeenCalledTimes(2);
  });
});
