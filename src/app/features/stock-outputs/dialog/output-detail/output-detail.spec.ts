import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OutputDetail } from './output-detail';
import { environment } from '../../../../../environments/environment';

const endpoint = `${environment.apiUrl}/Salida/9`;
const output = {
  idSalida: 9, noRequerimiento: 'REQ-9', fechaCreacion: '2026-10-20T12:00:00',
  recinto: { nombre: 'Central' }, tipoSalida: { nombre: 'Consumo' }, departamento: { nombre: 'Compras' },
  creadoPorU: { nombre: 'Usuario', apellido: 'Prueba' }, solicitante: 'Persona de prueba',
  solicitanteCargo: 'Analista', observacion: 'Entrega de prueba', total: 200, itbis: 36, totalGeneral: 236,
  detalles: [{ idSalidaDet: 1, producto: { nombre: 'Papel', descripcion: 'Resma' }, cantidad: 2,
    marca: 'Marca de prueba', modelo: 'Modelo A', condicion: 'Nuevo', serial: 'ABC-1',
    precio: 100, subTotal: 200, itbis: 36, totalGeneral: 236 }],
};

describe('OutputDetail', () => {
  let fixture: ComponentFixture<OutputDetail>;
  let http: HttpTestingController;
  const close = vi.fn();
  beforeEach(async () => {
    close.mockClear();
    await TestBed.configureTestingModule({ imports: [OutputDetail], providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: MAT_DIALOG_DATA, useValue: 9 }, { provide: MatDialogRef, useValue: { close } },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OutputDetail);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('loads the selected output and renders all sections and financial amounts', () => {
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
    const get = http.expectOne(endpoint);
    expect(get.request.method).toBe('GET');
    get.flush({ success: true, data: output });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    for (const value of ['REQ-9', '20/10/2026', 'Central', 'Consumo', 'Compras', 'Usuario Prueba',
      'Persona de prueba', 'Analista', 'Entrega de prueba', 'Papel', 'Resma', 'Marca de prueba',
      'Modelo A', 'Nuevo', 'ABC-1', '100.00', '200.00', '36.00', '236.00', 'Resumen financiero']) {
      expect(text).toContain(value);
    }
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeNull();
  });

  it('handles nullable relations, missing product data and zero amounts', () => {
    http.expectOne(endpoint).flush({ success: true, data: { ...output, recinto: null, tipoSalida: null,
      departamento: null, creadoPorU: null, fechaCreacion: null, observacion: null, total: null,
      detalles: [{ idSalidaDet: 1, producto: null, cantidad: 0, precio: 0, totalGeneral: 0 }] } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No disponible');
    expect(fixture.nativeElement.textContent).toContain('Producto no disponible');
    expect(fixture.nativeElement.textContent).toContain('Sin observaciones');
    expect(fixture.nativeElement.textContent).toContain('0.00');
  });

  it('renders the empty products message for null details', () => {
    http.expectOne(endpoint).flush({ success: true, data: { ...output, detalles: null } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Esta salida no tiene productos registrados');
  });

  it('handles a listed output whose detail endpoint returns null and allows retry', () => {
    http.expectOne(endpoint).flush({ success: true, data: null });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se encontró');
    fixture.nativeElement.querySelector('.btn-outline-primary').click();
    http.expectOne(endpoint).flush({ success: true, data: output });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('REQ-9');
  });

  it('handles HTTP errors and API failures', () => {
    http.expectOne(endpoint).flush('Error', { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo cargar');
    fixture.nativeElement.querySelector('.btn-outline-primary').click();
    http.expectOne(endpoint).flush({ success: false, data: null });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo cargar');
  });

  it('does not display a different output returned by the API', () => {
    http.expectOne(endpoint).flush({ success: true, data: { ...output, idSalida: 99 } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se encontró');
  });

  it('closes while loading and cancels the GET when destroyed', () => {
    const get = http.expectOne(endpoint);
    fixture.nativeElement.querySelector('[aria-label="Cerrar detalle de salida"]').click();
    expect(close).toHaveBeenCalledOnce();
    fixture.destroy();
    expect(get.cancelled).toBe(true);
  });
});
