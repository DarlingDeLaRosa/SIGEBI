import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EntryDetails } from './entry-details';
import { EntryDetailDialogData } from '../../model/entry-model';
import { environment } from '../../../../../environments/environment';

const snapshot: EntryDetailDialogData = { campusName: 'Central', warehouseName: 'Almacén', detail: {
  idEntradaDet: 2, idEntrada: 4, producto: { idProducto: 1, nombre: 'Papel', descripcion: 'Resma' },
  cantidad: 12, marca: 'Marca', modelo: 'Modelo', serial: 'ABC', condicion: 'Nuevo',
  precio: 100, itbisProducto: 216, subTotal: 1200, observacion: 'Observación de prueba',
} };

describe('EntryDetails', () => {
  let http: HttpTestingController;
  const close = vi.fn();
  async function setup(data: number | EntryDetailDialogData) {
    close.mockClear();
    await TestBed.configureTestingModule({ imports: [EntryDetails], providers: [
      provideHttpClient(), provideHttpClientTesting(), { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close } },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(EntryDetails);
    fixture.detectChanges();
    return fixture;
  }
  afterEach(() => http.verify());

  it('renders the loaded entry detail without requesting it again', async () => {
    const fixture = await setup(snapshot);
    const text = fixture.nativeElement.textContent;
    for (const value of ['No. Entrada', 'Detalle de entrada', 'Central', 'Almacén', 'Papel', 'Resma',
      'Marca', 'Modelo', 'ABC', 'Nuevo', '12', '100.00', '216.00', '1,200.00', 'Observación de prueba']) {
      expect(text).toContain(value);
    }
    http.expectNone(() => true);
    fixture.nativeElement.querySelector('[aria-label="Cerrar detalle de entrada"]').click();
    expect(close).toHaveBeenCalledOnce();
  });

  it('handles missing fields and preserves zero quantities and amounts', async () => {
    const fixture = await setup({ ...snapshot, detail: { idEntradaDet: 2, idEntrada: null,
      producto: null, cantidad: 0, marca: null, modelo: null, serial: null, precio: 0 } });
    expect(fixture.nativeElement.textContent).toContain('No disponible');
    expect(fixture.nativeElement.textContent).toContain('Producto no disponible');
    expect(fixture.nativeElement.textContent).toContain('0.00');
    expect(fixture.nativeElement.textContent).toContain('Sin observaciones');
    http.expectNone(() => true);
  });

  it('preserves the existing ID based entry dialog', async () => {
    const fixture = await setup(4);
    const req = http.expectOne(`${environment.apiUrl}/Entrada/4`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { idEntrada: 4, numOrden: 'ORD-4', detalles: [], total: 0, itbisGeneral: 0 } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ORD-4');
  });
});
