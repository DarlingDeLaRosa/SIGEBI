import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryAdjustmentFormFacade } from './inventory-adjustment-form-facade';
import { InventoryAdjustmentService } from '../services/inventory-adjustment-service';
import { InventoryAdjustmentReferenceService } from '../services/inventory-adjustment-reference-service';
import { Alert } from '../../../core/service/alert-service/alert';
import { CreateInventoryAdjustmentDto } from '../DTOs/inventory-adjustment-dto';

describe('InventoryAdjustmentFormFacade', () => {
  let facade: InventoryAdjustmentFormFacade;
  const save = vi.fn();
  const detail = {
    productId: 1,
    productName: 'Papel',
    countedQuantity: 5,
    inventoryQuantity: 10,
    observations: '',
    entryDetailId: 2,
    warehouseId: 3,
    warehouseName: 'Almacén',
    difference: -5,
  };

  beforeEach(() => {
    save.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        InventoryAdjustmentFormFacade,
        { provide: InventoryAdjustmentService, useValue: { saveAdjustment: save } },
        {
          provide: InventoryAdjustmentReferenceService,
          useValue: { getEntryDetails: () => of([]) },
        },
        { provide: Alert, useValue: { success: vi.fn() } },
      ],
    });
    facade = TestBed.inject(InventoryAdjustmentFormFacade);
    facade.form.patchValue({ campusId: 1, warehouseId: 3, countNumber: 'TF', date: '2026-09-07' });
    facade.selectedWarehouse.set({ idTipoAlm: 3, nombre: 'Almacén' });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('keeps the original detail when an edit is cancelled', () => {
    facade.details.set([detail]);
    facade.editDetail(0);
    facade.detailForm.patchValue({ countedQuantity: 0 });
    expect(facade.details()).toEqual([detail]);
    facade.clearDetail();
    expect(facade.details()).toEqual([detail]);
  });

  it('updates a detail in place and prevents duplicate entry details', () => {
    facade.details.set([detail]);
    facade.editDetail(0);
    facade.detailForm.patchValue({ countedQuantity: 0 });
    facade.addDetail();
    expect(facade.details()).toHaveLength(1);
    expect(facade.details()[0].difference).toBe(-10);
    facade.selectedProduct.set({ idProducto: 1, nombre: 'Papel' });
    facade.detailForm.patchValue({
      productId: 1,
      entryDetailId: 2,
      countedQuantity: 2,
      inventoryQuantity: 10,
    });
    facade.addDetail();
    expect(facade.details()).toHaveLength(1);
    expect(facade.detailError()).toContain('ya está incluido');
  });

  it('blocks submission without details and preserves the form on save failure', () => {
    facade.save();
    expect(save).not.toHaveBeenCalled();
    facade.details.set([detail]);
    save.mockReturnValue(throwError(() => new Error('Failure')));
    facade.save();
    expect(facade.details()).toEqual([detail]);
    expect(facade.form.controls.countNumber.value).toBe('TF');
    expect(facade.saving()).toBe(false);
    expect(facade.error()).toContain('No se pudo guardar');
  });

  it('prevents duplicate submissions while saving', () => {
    facade.details.set([detail]);
    const pending = new Subject<CreateInventoryAdjustmentDto>();
    save.mockReturnValue(pending);
    facade.save();
    facade.save();
    expect(save).toHaveBeenCalledOnce();
    pending.complete();
  });
});
