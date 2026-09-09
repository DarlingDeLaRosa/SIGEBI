import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryAdjustmentFacade } from './inventory-adjustment-facade';
import { InventoryAdjustmentService } from '../services/inventory-adjustment-service';

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
  beforeEach(() => {
    search.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        InventoryAdjustmentFacade,
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
});
