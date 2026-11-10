import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { Home } from './home';

describe('Inicio', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [Home],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  }));

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('muestra las primeras tres filas y comparte las consultas de órdenes y conciliaciones', () => {
    const fixture = TestBed.createComponent(Home);
    const http = TestBed.inject(HttpTestingController);
    const order = { id: 9, noOrden: 'OC-9' };
    const orders = http.expectOne(req => req.url.endsWith('/OrdenCompras'));
    expect(orders.request.params.get('estado')).toBe('1');
    expect(orders.request.params.get('cantItem')).toBe('3');
    orders.flush({ success: true, data: [order], totalItems: 8 });
    http.expectOne(req => req.url.endsWith('/Solicitudes/estados'))
      .flush({ success: true, data: [{ id: 6, nombre: 'Pendiente' }] });
    const requests = http.expectOne(req => req.url.endsWith('/Solicitudes'));
    expect(requests.request.body).toMatchObject({ page: 1, CantItems: 3, idEstadoSolicitud: 6 });
    requests.flush({ success: true, data: [{ id: 1 }] });
    const transfers = http.expectOne(req => req.url.endsWith('/gettrasferencias/1/3'));
    expect(transfers.request.params.get('Estado')).toBe('Pendiente');
    transfers.flush({ success: true, data: [] });
    const entries = http.expectOne(req => req.url.endsWith('/Entrada/getFilters'));
    expect(entries.request.body).toMatchObject({ page: 1, cantItems: 3 });
    entries.flush({ success: true, data: [4, 2, 3, 1].map(id => ({ idEntrada: id, noFactura: 'FAC-' + id })) });
    const outputs = http.expectOne(req => req.url.endsWith('/Salida/filter'));
    expect(outputs.request.params.get('CantItems')).toBe('3');
    outputs.flush({ success: true, data: [] });
    const adjustments = http.expectOne(req => req.url.endsWith('/AjusteInventario/get_filter'));
    expect(adjustments.request.params.get('CantItems')).toBe('3');
    adjustments.flush({ success: true, data: [], totalItems: 0 });

    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const text = page.textContent ?? '';
    expect(text.indexOf('FAC-4')).toBeLessThan(text.indexOf('FAC-2'));
    expect(text).toContain('FAC-3');
    expect(text).not.toContain('FAC-1');
    expect(text).toContain('Hay pendientes');
    expect(text).toContain('Sin pendientes');
    expect(text).toContain('—');
    expect(text).toContain('Sin conciliaciones');
    expect(Array.from(page.querySelectorAll('.summary-total'), node => node.textContent)).toEqual(['8']);
    expect(page.querySelectorAll('.movement-panel .empty-table .bi-database-x')).toHaveLength(2);
    expect(page.querySelector('.summary-card .empty-table')).toBeNull();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    page.querySelector<HTMLButtonElement>('.dropdown-item')!.click();
    expect(navigate).toHaveBeenCalledWith(['/layout/entradas/gestionar-Entradas'], {
      state: { purchaseContract: { row: order, index: 0 } },
    });
  });

  it('reintenta únicamente el bloque que falló', () => {
    const fixture = TestBed.createComponent(Home);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando');
    http.expectOne(req => req.url.endsWith('/Solicitudes/estados')).flush({ success: true, data: [] });
    for (const endpoint of ['/OrdenCompras', '/gettrasferencias/1/3', '/Entrada/getFilters', '/Salida/filter']) {
      http.expectOne(req => req.url.endsWith(endpoint)).flush({ success: true, data: [] });
    }
    http.expectOne(req => req.url.endsWith('/AjusteInventario/get_filter'))
      .flush({ success: true, data: [{ id: 4, idRecinto: 2, tomaFisicaNo: 'TF-4' }] });
    const campuses = http.expectOne(req => req.url.endsWith('/GenericService/getallrecintos'));
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.textContent).toContain('TF-4');
    campuses.flush('Error', { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(page.textContent).toContain('TF-4');
    expect(page.textContent).toContain('No disponible');
    expect(page.querySelector('a[href="/layout/salidas"]')).toBeTruthy();
    expect(page.textContent).toContain('Datos no disponibles');
    page.querySelector<HTMLButtonElement>('.summary-card button')!.click();
    http.expectOne(req => req.url.endsWith('/Solicitudes/estados'))
      .flush('Error', { status: 500, statusText: 'Error' });
  });
});
