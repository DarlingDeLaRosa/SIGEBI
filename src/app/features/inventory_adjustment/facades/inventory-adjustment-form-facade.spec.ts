import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryAdjustmentFormFacade } from './inventory-adjustment-form-facade';
import { InventoryAdjustmentService } from '../services/inventory-adjustment-service';
import { InventoryAdjustmentReferenceService } from '../services/inventory-adjustment-reference-service';
import { Alert } from '../../../core/service/alert-service/alert';
import { CreateInventoryAdjustmentDto } from '../DTOs/inventory-adjustment-dto';
import { IntranetService } from '../../../shared/service/general.service';

describe('InventoryAdjustmentFormFacade', () => {
  let facade: InventoryAdjustmentFormFacade;
  const save = vi.fn();
  const people = vi.fn();
  const entries = vi.fn();
  const alert = { success: vi.fn(), error: vi.fn() };
  const person = { idPersona: 8, nombreCompleto: 'Ana Pérez', cargo: { nombre: 'Analista' } };
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
    people.mockReset();
    entries.mockReset().mockReturnValue(of([]));
    alert.error.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        InventoryAdjustmentFormFacade,
        { provide: InventoryAdjustmentService, useValue: { saveAdjustment: save } },
        {
          provide: InventoryAdjustmentReferenceService,
          useValue: { getEntryDetails: entries },
        },
        { provide: Alert, useValue: alert },
        { provide: IntranetService, useValue: { filterPeople: people } },
      ],
    });
    facade = TestBed.inject(InventoryAdjustmentFormFacade);
    facade.form.patchValue({ campusId: 1, warehouseId: 3, countNumber: 'TF', date: '2026-09-07', startTime: '08:00', endTime: '10:00' });
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

  it('searches people and fills their position without an account lookup', () => {
    people.mockReturnValue(of({ status: true, data: [{ idPersona: 8, nombre: 'Ana', apellidos: 'Pérez', cargo: { nombre: 'Analista' } }] }));
    facade.loadPeople(' Ana ');
    expect(people).toHaveBeenCalledExactlyOnceWith('Ana');
    facade.selectParticipant(facade.people()[0]);
    expect(facade.participantForm.getRawValue()).toEqual({ name: 'Ana Pérez', position: 'Analista' });
    facade.addParticipant();
    expect(facade.participants()).toEqual([{ name: 'Ana Pérez', position: 'Analista', personId: 8 }]);
    expect(facade.selectedParticipant()).toBeNull();
    expect(facade.participantForm.pristine).toBe(true);
  });

  it('cancels old searches and clears the selected name and position immediately', () => {
    const pending = new Subject<any>();
    people.mockReturnValue(pending);
    facade.loadPeople('Ana');
    facade.selectParticipant(person);
    facade.participantSearchChanged();
    pending.next({ status: true, data: [{ nombre: 'Anterior' }] });
    expect(facade.people()).toEqual([]);
    expect(facade.selectedParticipant()).toBeNull();
    expect(facade.participantForm.getRawValue()).toEqual({ name: '', position: '' });
    facade.loadPeople(' ');
    expect(people).toHaveBeenCalledOnce();
  });

  it('rejects a person without a position and alerts on a failed search', () => {
    facade.selectParticipant({ ...person, cargo: null });
    expect(facade.selectedParticipant()).toBeNull();
    expect(facade.participantForm.invalid).toBe(true);
    expect(alert.error).toHaveBeenCalledWith('La persona seleccionada no tiene nombre o cargo registrado');
    people.mockReturnValue(throwError(() => new Error('Failure')));
    facade.loadPeople('Ana');
    expect(alert.error).toHaveBeenLastCalledWith('No se pudieron buscar los participantes');
  });

  it('rejects duplicate identities and legacy names while allowing editing the same row', () => {
    facade.selectParticipant(person);
    facade.addParticipant();
    facade.selectParticipant({ ...person, nombreCompleto: 'Nombre actualizado' });
    facade.addParticipant();
    expect(facade.participants()).toHaveLength(1);
    expect(alert.error).toHaveBeenLastCalledWith('Esta persona ya está incluida en los participantes');
    facade.participants.set([{ name: ' Ana  Pérez ', position: 'ANALISTA' }]);
    facade.selectParticipant(person);
    facade.addParticipant();
    expect(facade.participants()).toHaveLength(1);
    facade.editParticipant(0);
    expect(facade.selectedParticipant()?.nombreCompleto).toBe(' Ana  Pérez ');
    facade.addParticipant();
    expect(facade.participants()).toHaveLength(1);
    expect(facade.participants()[0].name).toBe('Ana  Pérez');
  });

  it('replaces and removes existing participants', () => {
    facade.participants.set([{ name: 'Anterior', position: 'Cargo anterior' }]);
    facade.editParticipant(0);
    facade.selectParticipant(person);
    facade.addParticipant();
    expect(facade.participants()).toEqual([{ name: 'Ana Pérez', position: 'Analista', personId: 8 }]);
    facade.removeParticipant(0);
    expect(facade.participants()).toEqual([]);
  });

  it('sends only name and position for participants to preserve the API contract', () => {
    facade.selectParticipant(person);
    facade.addParticipant();
    facade.details.set([detail]);
    save.mockReturnValue(of({}));
    facade.save();
    expect(save).toHaveBeenCalledOnce();
    expect(save.mock.calls[0][0].participantes).toEqual([{ nombre: 'Ana Pérez', cargo: 'Analista' }]);
  });

  it('clears warehouse and product on campus change and blocks it once details exist', () => {
    facade.selectedProduct.set({ idProducto: 1, nombre: 'Papel' });
    facade.detailForm.patchValue({ productId: 1, entryDetailId: 2, inventoryQuantity: 10 });
    facade.selectCampus(2);
    expect(facade.form.controls.campusId.value).toBe(2);
    expect(facade.form.controls.warehouseId.value).toBe(0);
    expect(facade.selectedWarehouse()).toBeNull();
    expect(facade.selectedProduct()).toBeNull();
    facade.details.set([detail]);
    facade.selectCampus(3);
    expect(facade.form.controls.campusId.value).toBe(2);
  });

  it('cancels pending entry requests when product text changes', () => {
    const pending = new Subject<any[]>();
    entries.mockReturnValue(pending);
    facade.selectProduct({ idProducto: 1, nombre: 'Papel' });
    expect(facade.loadingEntries()).toBe(true);
    facade.productSearchChanged();
    pending.next([{ idEntradaDet: 99 }]);
    expect(facade.loadingEntries()).toBe(false);
    expect(facade.selectedProduct()).toBeNull();
    expect(facade.entryDetails()).toEqual([]);
    expect(facade.detailForm.controls.inventoryQuantity.value).toBeNull();
    expect(facade.detailForm.controls.entryDetailId.value).toBe(0);
  });

  it('still blocks new details without confirmed inventory and allows zero physical counts', () => {
    facade.selectedProduct.set({ idProducto: 1, nombre: 'Papel' });
    facade.detailForm.patchValue({ productId: 1, entryDetailId: 2, countedQuantity: 0 });
    facade.selectEntry();
    facade.addDetail();
    expect(facade.details()).toEqual([]);
    expect(facade.detailForm.controls.inventoryQuantity.value).toBeNull();
    facade.details.set([detail]);
    facade.editDetail(0);
    facade.detailForm.controls.countedQuantity.setValue(0);
    facade.addDetail();
    expect(facade.details()[0].countedQuantity).toBe(0);
  });

  it('fills inventory from the selected entry quantity and adds the resulting difference', () => {
    entries.mockReturnValue(of([{ idEntradaDet: 2, idEntrada: 4, producto: { idProducto: 1, nombre: 'Papel' },
      marca: null, modelo: null, serial: null, cantidad: 10 }]));
    facade.selectProduct({ idProducto: 1, nombre: 'Papel' });
    facade.detailForm.patchValue({ entryDetailId: 2, countedQuantity: 7 });
    facade.selectEntry();
    expect(facade.detailForm.controls.inventoryQuantity.value).toBe(10);
    expect(facade.selectedEntry()?.idEntrada).toBe(4);
    facade.addDetail();
    expect(facade.details()[0]).toMatchObject({ inventoryQuantity: 10, countedQuantity: 7, difference: -3 });
    expect(facade.selectedEntry()).toBeNull();
  });

  it('accepts zero entry quantity, rejects invalid quantity and clears a previous selection', () => {
    const entry = { idEntradaDet: 2, idEntrada: 4, producto: { idProducto: 1, nombre: 'Papel' },
      marca: null, modelo: null, serial: null, cantidad: 0 };
    facade.entryDetails.set([entry]);
    facade.detailForm.patchValue({ entryDetailId: 2 });
    facade.selectEntry();
    expect(facade.detailForm.controls.inventoryQuantity.value).toBe(0);
    for (const cantidad of [null, -1, 1.5]) {
      facade.entryDetails.set([{ ...entry, cantidad }]);
      facade.selectEntry();
      expect(facade.detailForm.controls.inventoryQuantity.value).toBeNull();
    }
    facade.detailForm.patchValue({ entryDetailId: 0 });
    facade.selectEntry();
    expect(facade.selectedEntry()).toBeNull();
    expect(facade.detailForm.controls.inventoryQuantity.value).toBeNull();
  });
});
