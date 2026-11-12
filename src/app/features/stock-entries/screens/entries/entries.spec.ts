import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Entries } from './entries';

describe('Entries', () => {
  it('limpia los cuatro selectores de filtros y consulta una sola vez', () => {
    TestBed.configureTestingModule({
      imports: [Entries],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Entries);
    const screen = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    const response = { data: [], currentPage: 1, cantItem: 10, cantPage: 1, totalItems: 0 };
    screen.filteringentries.set(true);
    fixture.detectChanges();
    http.match(() => true).forEach(request => request.flush(response));

    const filters = [
      ['idTipoEntrada', 'Tipo de entrada', { nombre: 'Recepción' }],
      ['idTipoEntrega', 'Tipo de entrega', { nombre: 'Parcial' }],
      ['idProveedor', 'Proveedor', { razonSocial: 'Proveedor de prueba' }],
      ['idRecinto', 'Recinto', { nombre: 'Recinto central' }],
    ] as const;
    for (const [key, , option] of filters) {
      screen.setSelection(screen.facade.formSelections[key], screen.filterForm, key, { ...option, [key]: 3 }, key);
    }
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const inputs = filters.map(([, placeholder]) =>
      page.querySelector<HTMLInputElement>('input[placeholder="' + placeholder + '"]')!);
    expect(inputs.map(input => input.value)).toEqual(['Recepción', 'Parcial', 'Proveedor de prueba', 'Recinto central']);

    page.querySelector<HTMLButtonElement>('app-form-actions button.remove')!.click();
    fixture.detectChanges();

    expect(inputs.map(input => input.value)).toEqual(['', '', '', '']);
    for (const [key] of filters) {
      expect(screen.filterForm.controls[key].value).toBeNull();
      expect(screen.facade.formSelections[key]()).toBeNull();
    }
    const request = http.expectOne(req => req.method === 'POST' && req.url.endsWith('/Entrada/getFilters'));
    expect(request.request.body).toMatchObject({ page: 1, cantItems: 10 });
    for (const [key] of filters) expect(request.request.body[key] ?? null).toBeNull();
    request.flush(response);
    http.verify();
  });
});
