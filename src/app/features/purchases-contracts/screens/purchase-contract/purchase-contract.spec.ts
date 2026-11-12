import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PurchaseContract } from './purchase-contract';

describe('PurchaseContract', () => {
  it('limpia el estado visible y los demás filtros con una sola consulta', () => {
    TestBed.configureTestingModule({
      imports: [PurchaseContract],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(PurchaseContract);
    const screen = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    const response = { data: [], currentPage: 1, cantItem: 10, cantPage: 1, totalItems: 0 };
    screen.filteringPurchasesContracts.set(true);
    fixture.detectChanges();
    http.match(() => true).forEach(request => request.flush(response));

    screen.setSelection(screen.facade.filterSelections.status, screen.filterForm,
      'estado', { name: 'Recibida', value: 2 }, 'value');
    screen.setSelection(screen.facadeReference.filterSelections.idProveedor, screen.filterForm,
      'idProveedor', { razonSocial: 'Proveedor de prueba', idProveedor: 5 }, 'idProveedor');
    fixture.detectChanges();

    const page: HTMLElement = fixture.nativeElement;
    const state = page.querySelector<HTMLInputElement>('input[placeholder="Estado de orden"]')!;
    expect(state.value).toBe('Recibida');
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    http.expectOne(req => req.url.endsWith('/OrdenCompras') && req.params.get('estado') === '2').flush(response);

    page.querySelector<HTMLButtonElement>('app-form-actions button.remove')!.click();
    fixture.detectChanges();

    expect(state.value).toBe('');
    expect(screen.filterForm.controls.estado.value).toBeNull();
    expect(screen.filterForm.controls.idProveedor.value).toBeNull();
    expect(screen.facadeReference.filterSelections.idProveedor()).toBeNull();
    const request = http.expectOne(req => req.url.endsWith('/OrdenCompras'));
    expect(request.request.params.has('estado')).toBe(false);
    expect(request.request.params.has('idProveedor')).toBe(false);
    request.flush(response);
    http.verify();
  });
});
