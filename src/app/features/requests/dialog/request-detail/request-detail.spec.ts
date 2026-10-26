import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestDetail } from './request-detail';
import { environment } from '../../../../../environments/environment';

const endpoint = `${environment.apiUrl}/Solicitudes/12`;
const request = {
  id: 12, noRequerimiento: 'REQ-12', fecha: '2026-10-20T12:00:00',
  recintoObj: { nombre: 'Sede central' }, estadoObj: { nombre: 'Pendiente' },
  tipoArtiucloObj: { nombre: 'Materiales' }, tipoSolicitudObj: { nombre: 'Interna' },
  solicitante: 'Persona de prueba', cargoSolicitante: 'Analista', unidadOrganizativa: 'Compras',
  observaciones: 'Entrega de prueba', detallesSolicitud: [{ id: 1, idProducto: 7,
    productoObj: { nombre: 'Papel', descripcion: 'Resma', precio: 100, itbis: 18 }, cantidadSolicitada: 3 }],
};

describe('RequestDetail', () => {
  let fixture: ComponentFixture<RequestDetail>;
  let http: HttpTestingController;
  const close = vi.fn();
  beforeEach(async () => {
    close.mockClear();
    await TestBed.configureTestingModule({ imports: [RequestDetail], providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: MAT_DIALOG_DATA, useValue: 12 },
      { provide: MatDialogRef, useValue: { close } },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RequestDetail);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('loads the selected request and renders its header, applicant and products', () => {
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
    const get = http.expectOne(endpoint);
    expect(get.request.method).toBe('GET');
    get.flush({ success: true, data: request });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    for (const value of ['REQ-12', '20/10/2026', 'Sede central', 'Pendiente', 'Materiales', 'Interna',
      'Persona de prueba', 'Analista', 'Compras', 'Entrega de prueba', 'Papel', 'Resma', 'Cantidad solicitada']) {
      expect(text).toContain(value);
    }
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeNull();
    http.expectNone(req => req.method !== 'GET');
  });

  it('accepts an array response and handles missing related objects', () => {
    http.expectOne(endpoint).flush({ success: true, data: [{ ...request, recintoObj: null,
      estadoObj: null, tipoArtiucloObj: null, tipoSolicitudObj: null,
      detallesSolicitud: [{ id: 1, idProducto: 7, productoObj: null, cantidadSolicitada: 3 }] }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No disponible');
    expect(fixture.nativeElement.textContent).toContain('Producto #7');
  });

  it('renders an empty product list when details are null', () => {
    http.expectOne(endpoint).flush({ success: true, data: { ...request, detallesSolicitud: null } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Esta solicitud no tiene productos registrados');
  });

  it('reports a failed GET and allows retrying', () => {
    http.expectOne(endpoint).flush('Error', { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo cargar');
    fixture.nativeElement.querySelector('.btn-outline-primary').click();
    http.expectOne(endpoint).flush({ success: true, data: request });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('REQ-12');
  });

  it('does not display a different request returned by the API', () => {
    http.expectOne(endpoint).flush({ success: true, data: { ...request, id: 99 } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se encontró');
  });

  it('allows closing during loading and cancels the GET when destroyed', () => {
    const get = http.expectOne(endpoint);
    fixture.nativeElement.querySelector('[aria-label="Cerrar detalle de solicitud"]').click();
    expect(close).toHaveBeenCalledOnce();
    fixture.destroy();
    expect(get.cancelled).toBe(true);
  });
});
