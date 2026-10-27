import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryAdjustmentFacade } from './inventory-adjustment-facade';
import { InventoryAdjustmentService } from '../services/inventory-adjustment-service';
import { Alert } from '../../../core/service/alert-service/alert';

describe('InventoryAdjustmentFacade', () => {
  const search = vi.fn(() =>
    of({
      success: true,
      message: '',
      data: [],
      currentPage: 1,
      cantPage: 3,
      cantItem: 10,
      totalItems: null,
    }),
  );
  let facade: InventoryAdjustmentFacade;
  const alert = { error: vi.fn() };
  beforeEach(() => {
    search.mockClear();
    alert.error.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        InventoryAdjustmentFacade,
        { provide: Alert, useValue: alert },
        { provide: InventoryAdjustmentService, useValue: { searchAdjustments: search } },
      ],
    });
    facade = TestBed.inject(InventoryAdjustmentFacade);
  });
  it('preserves filters when changing pages and page size', () => {
    const filters = { idRecinto: 1, idTipoAlmacen: 2, numeroTomaFisica: 'TF', idProducto: 3 };
    facade.applyFilters(filters);
    facade.changePage(2);
    expect(search).toHaveBeenLastCalledWith(filters, 2, 10);
    facade.changePageSize(20);
    expect(search).toHaveBeenLastCalledWith(filters, 1, 20);
    expect(facade.totalItems()).toBeNull();
  });

  it('keeps requested pagination when the server returns a row count and a zero based page', () => {
    search.mockReturnValueOnce(of({ success: true, message: '', data: [], currentPage: 0,
      cantPage: 3, cantItem: 1, totalItems: null }));
    facade.changePage(2);
    expect(facade.pagination()).toMatchObject({ currentPage: 2, pageSize: 10, totalPages: 3 });
  });

  it('shows the standard error alert once when a list request fails', () => {
    search.mockReturnValueOnce(throwError(() => new Error('Failure')));
    facade.loadData();
    expect(alert.error).toHaveBeenCalledOnce();
    expect(alert.error).toHaveBeenCalledWith('No se pudieron cargar las conciliaciones. Intenta nuevamente.');
    expect(facade.loading()).toBe(false);
  });
});
