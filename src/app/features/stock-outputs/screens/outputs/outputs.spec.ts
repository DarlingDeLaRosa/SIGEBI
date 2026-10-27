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

const endpoint = `${environment.apiUrl}/Salida`;
const output = { idSalida: 9, noRequerimiento: 'REQ-9', recinto: { idRecinto: 7, nombre: 'Central' },
  tipoSalida: { idTipoSalida: 2, nombre: 'Consumo' }, departamento: { idDepar: 1, nombre: 'Compras' },
  solicitante: 'Persona de prueba', fechaCreacion: '2026-10-20T12:00:00', totalGeneral: 118 };
const page = { success: true, data: [output], currentPage: 1, cantItem: 1, cantPage: 2, totalItems: null };

describe('Outputs', () => {
  let fixture: ComponentFixture<Outputs>;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Outputs], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
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
    expect(req.request.method).toBe('GET');
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

  it('uses GET when the table changes page or page size without adopting the server row count', () => {
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
});
