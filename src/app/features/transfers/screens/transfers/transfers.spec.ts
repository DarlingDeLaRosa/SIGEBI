import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Transfers } from './transfers';
import { environment } from '../../../../../environments/environment';

describe('Transfers', () => {
  let fixture: ComponentFixture<Transfers>;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/Salida`;
  const response = {
    success: true,
    data: [],
    currentPage: 1,
    cantItem: 10,
    cantPage: 1,
    totalItems: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Transfers],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(Transfers);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(`${endpoint}/gettrasferencias/1/10`).flush(response);
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('retains the submitted filter during paging and returns to the unfiltered route when cleared', () => {
    const component = fixture.componentInstance;
    component.filterForm.setValue({ filter: 'pendiente' });
    component.applyFilters();
    http
      .expectOne(`${endpoint}/gettrasferencias_filter/pendiente/1/10`)
      .flush({ ...response, cantPage: 3 });
    component.filterForm.setValue({ filter: 'unsent text' });
    component.changePage(2);
    http
      .expectOne(`${endpoint}/gettrasferencias_filter/pendiente/2/10`)
      .flush({ ...response, currentPage: 2, cantPage: 3 });
    component.changePageSize(20);
    http.expectOne(`${endpoint}/gettrasferencias_filter/pendiente/1/20`).flush(response);
    component.clearForm();
    http.expectOne(`${endpoint}/gettrasferencias/1/20`).flush(response);
    expect(component.filterForm.controls.filter.value).toBe('');
  });

  it('shows page controls without fabricating a total and does not expose edit/delete actions', () => {
    fixture.componentInstance.loadData();
    http
      .expectOne(`${endpoint}/gettrasferencias/1/10`)
      .flush({
        ...response,
        cantPage: 2,
        totalItems: null,
        data: [
          {
            id: 1,
            fecha: null,
            estado: 'Pendiente',
            creadoPor: null,
            verificadoPor: null,
            salida: null,
            recinto: null,
          },
        ],
      });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Página 1 de 2');
    expect(element.textContent).not.toContain('Total:');
    expect(element.querySelectorAll('.btn-page').length).toBeGreaterThan(0);
    expect(element.querySelector('.item-edit')).toBeNull();
    expect(element.querySelector('.item-delete')).toBeNull();
    expect(element.querySelector('.item-detail')).not.toBeNull();
  });

  it('cancels an older request so stale results cannot replace the current filter', () => {
    const component = fixture.componentInstance;
    component.filterForm.setValue({ filter: 'first' });
    component.applyFilters();
    const first = http.expectOne(`${endpoint}/gettrasferencias_filter/first/1/10`);
    component.filterForm.setValue({ filter: 'second' });
    component.applyFilters();
    expect(first.cancelled).toBe(true);
    http.expectOne(`${endpoint}/gettrasferencias_filter/second/1/10`).flush(response);
    expect(component.facade.loading()).toBe(false);
  });

  it('renders a retryable error instead of an empty-success message on network failures', () => {
    fixture.componentInstance.loadData();
    http
      .expectOne(`${endpoint}/gettrasferencias/1/10`)
      .flush('Failure', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Reintentar');
    expect(element.textContent).not.toContain('No se encontraron datos');
  });
});
