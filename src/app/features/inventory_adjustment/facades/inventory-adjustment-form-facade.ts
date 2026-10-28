import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { Alert } from '../../../core/service/alert-service/alert';
import { InventoryAdjustmentForms } from '../forms/inventory-adjustment-forms';
import {
  InventoryAdjustmentDetail,
  InventoryAdjustmentParticipant,
  ParticipantPerson,
} from '../model/inventory-adjustment-model';
import {
  EntryDetailOptionDto,
  ProductOptionDto,
  WarehouseDto,
} from '../DTOs/inventory-adjustment-dto';
import { InventoryAdjustmentService } from '../services/inventory-adjustment-service';
import { InventoryAdjustmentReferenceService } from '../services/inventory-adjustment-reference-service';
import { InventoryAdjustmentMapper } from '../mappers/inventory-adjustment-mapper';
import { IntranetService } from '../../../shared/service/general.service';

@Injectable()
export class InventoryAdjustmentFormFacade {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(InventoryAdjustmentService);
  private readonly referenceService = inject(InventoryAdjustmentReferenceService);
  private readonly router = inject(Router);
  private readonly alert = inject(Alert);
  private readonly intranet = inject(IntranetService);
  private entryRequest?: Subscription;
  private personRequest?: Subscription;
  readonly people = signal<ParticipantPerson[]>([]);
  readonly selectedParticipant = signal<ParticipantPerson | null>(null);
  showinfoEntry: boolean = false
  readonly form = InventoryAdjustmentForms.create(this.fb);
  readonly participantForm = InventoryAdjustmentForms.participant(this.fb);
  readonly detailForm = InventoryAdjustmentForms.detail(this.fb);
  readonly participants = signal<InventoryAdjustmentParticipant[]>([]);
  readonly participantRows = computed(() =>
    this.participants().map((participant, index) => ({ ...participant, rowKey: index })),
  );
  readonly details = signal<InventoryAdjustmentDetail[]>([]);
  readonly selectedWarehouse = signal<WarehouseDto | null>(null);
  readonly selectedProduct = signal<ProductOptionDto | null>(null);
  readonly entryDetails = signal<EntryDetailOptionDto[]>([]);
  readonly selectedEntry = signal<EntryDetailOptionDto | null>(null);
  readonly editingDetailIndex = signal<number | null>(null);
  readonly editingParticipantIndex = signal<number | null>(null);
  readonly loading = signal(false);
  readonly loadingEntries = signal(false);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly error = signal('');
  readonly detailError = signal('');
  readonly totals = computed(() =>
    this.details().reduce(
      (total, detail) => ({
        inventory: total.inventory + detail.inventoryQuantity,
        counted: total.counted + detail.countedQuantity,
        difference: total.difference + detail.difference,
      }),
      { inventory: 0, counted: 0, difference: 0 },
    ),
  );

  private reportError(message: string) {
    this.error.set(message);
    if (message) this.alert.error(message);
  }

  private reportDetailError(message: string) {
    this.detailError.set(message);
    if (message) this.alert.error(message);
  }

  participantSearchChanged() {
    this.personRequest?.unsubscribe();
    this.people.set([]);
    this.selectedParticipant.set(null);
    this.participantForm.patchValue({ name: '', position: '' });
    this.participantForm.markAsDirty();
  }

  loadPeople(filter: string) {
    this.personRequest?.unsubscribe();
    if (!filter.trim()) { this.people.set([]); return; }
    this.personRequest = this.intranet.filterPeople(filter.trim())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: response => {
          if (!response.status) {
            this.people.set([]);
            this.reportError('No se pudieron buscar los participantes');
            return;
          }
          this.people.set((response.data ?? []).map(person => ({ ...person,
            nombreCompleto: [person.nombre, person.apellidos].filter(Boolean).join(' ').trim(),
          })));
        },
        error: () => { this.people.set([]); this.reportError('No se pudieron buscar los participantes'); },
      });
  }

  selectParticipant(person: ParticipantPerson | null) {
    this.personRequest?.unsubscribe();
    if (!person) { this.participantSearchChanged(); return; }
    if (!person.nombreCompleto?.trim() || !person.cargo?.nombre?.trim()) {
      this.participantSearchChanged();
      this.reportError('La persona seleccionada no tiene nombre o cargo registrado');
      return;
    }
    this.selectedParticipant.set(person);
    this.participantForm.patchValue({ name: person.nombreCompleto.trim(), position: person.cargo.nombre.trim() });
    this.participantForm.markAsDirty();
  }

  selectCampus(campusId: number) {
    if (this.details().length || this.loading() || this.saving()) return;
    this.form.patchValue({ campusId });
    this.form.markAsDirty();
    this.changeCampus();
  }

  productSearchChanged() {
    this.clearDetail();
    this.detailForm.markAsDirty();
  }

  load(id: number) {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.service
      .getAdjustment(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          const adjustment = InventoryAdjustmentMapper.fromApi(response);
          this.form.patchValue({
            ...adjustment,
            campusId: adjustment.campusId ?? 0,
            warehouseId: adjustment.warehouseId ?? 0,
            date: adjustment.date.slice(0, 10),
          });
          this.selectedWarehouse.set(response.tipoAlmacenObj ?? null);
          this.participants.set(adjustment.participants);
          this.details.set(adjustment.details);
        },
        error: () => {
          this.loadFailed.set(true);
          this.reportError(
            'No se pudo cargar la conciliación. Vuelve al listado e intenta nuevamente.',
          );
        },
      });
  }

  selectWarehouse(item: WarehouseDto | null) {
    if (this.details().length) return;
    const campusId = this.form.controls.campusId.value;
    if (item?.idRecinto && campusId && item.idRecinto !== campusId) {
      this.reportError('El almacén seleccionado no pertenece al recinto.');
      return;
    }
    this.reportError('');
    this.selectedWarehouse.set(item || null);
    this.form.patchValue({ warehouseId: item?.idTipoAlm ?? 0 });
    this.form.markAsDirty();
    this.clearDetail();
  }

  changeCampus() {
    if (!this.details().length) this.selectWarehouse(null);
  }

  selectProduct(item: ProductOptionDto | null) {
    this.entryRequest?.unsubscribe();
    this.entryDetails.set([]);
    this.selectedEntry.set(null);
    this.reportDetailError('');
    this.selectedProduct.set(item || null);
    this.detailForm.patchValue({
      productId: item?.idProducto ?? 0,
      entryDetailId: 0,
      inventoryQuantity: null,
    });
    this.detailForm.markAsDirty();
    if (!item || !this.form.controls.warehouseId.value) return;
    this.loadingEntries.set(true);
    this.entryRequest = this.referenceService
      .getEntryDetails(item.idProducto, this.form.controls.warehouseId.value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingEntries.set(false)),
      )
      .subscribe({
        next: (details) => {
          this.entryDetails.set(details);
          if (!details.length)
            this.reportDetailError('No hay entradas disponibles para este producto y almacén.');
        },
        error: () => this.reportDetailError('No se pudieron cargar los detalles de entrada.'),
      });
  }

  selectEntry() {
    this.showinfoEntry = true
    const entry = this.entryDetails().find(item => item.idEntradaDet === this.detailForm.controls.entryDetailId.value) ?? null;
    this.selectedEntry.set(entry);
    const quantity = entry?.cantidad;
    const valid = typeof quantity === 'number' && Number.isInteger(quantity) && quantity >= 0;
    this.detailForm.patchValue({ inventoryQuantity: valid ? quantity : null });
    this.detailForm.markAsDirty();
    this.reportDetailError(entry && !valid ? 'La entrada seleccionada no tiene una cantidad válida para completar la existencia.' : '');
  }

  addDetail() {
    if (this.saving() || this.loading() || this.loadingEntries()) return;
    this.reportDetailError('');
    if (
      this.detailForm.invalid ||
      !this.selectedProduct() ||
      !this.form.controls.warehouseId.value
    ) {
      this.detailForm.markAllAsTouched();
      this.reportDetailError(
        'Selecciona una entrada con existencia disponible y completa un conteo entero mayor o igual a cero.',
      );
      return;
    }
    const value = this.detailForm.getRawValue();
    const index = this.editingDetailIndex();
    if (
      this.details().some(
        (detail, position) => position !== index && detail.entryDetailId === value.entryDetailId,
      )
    ) {
      this.reportDetailError('Este detalle de entrada ya está incluido en el conteo.');
      return;
    }
    const detail: InventoryAdjustmentDetail = {
      productId: value.productId,
      productName: this.selectedProduct()?.nombre ?? '',
      entryDetailId: value.entryDetailId,
      inventoryQuantity: value.inventoryQuantity!,
      countedQuantity: value.countedQuantity!,
      observations: value.observations.trim(),
      warehouseId: this.form.controls.warehouseId.value,
      warehouseName: this.selectedWarehouse()?.nombre ?? '',
      difference: value.countedQuantity! - value.inventoryQuantity!,
    };
    this.details.update((items) =>
      index === null
        ? [...items, detail]
        : items.map((item, position) => (position === index ? detail : item)),
    );
    this.clearDetail();
  }

  editDetail(index: number) {
    const detail = this.details()[index];
    if (!detail) return;
    this.selectedEntry.set(null);
    this.entryRequest?.unsubscribe();
    this.editingDetailIndex.set(index);
    this.selectedProduct.set({ idProducto: detail.productId, nombre: detail.productName });
    this.detailForm.reset(detail);
    this.detailForm.markAsDirty();
    this.entryDetails.set([
      {
        idEntradaDet: detail.entryDetailId,
        idEntrada: null,
        producto: { idProducto: detail.productId, nombre: detail.productName },
        marca: null,
        modelo: null,
        serial: null,
        cantidad: null,
      },
    ]);
    this.reportDetailError('');
  }

  removeDetail(index: number) {
    this.details.update((items) => items.filter((_, position) => position !== index));
    this.clearDetail();
  }

  clearDetail() {
    this.entryRequest?.unsubscribe();
    this.editingDetailIndex.set(null);
    this.selectedProduct.set(null);
    this.selectedEntry.set(null);
    this.entryDetails.set([]);
    this.reportDetailError('');
    this.detailForm.reset();
  }

  addParticipant() {
    if (this.saving() || this.loading()) return;
    if (this.participantForm.invalid || !this.selectedParticipant()) {
      this.participantForm.markAllAsTouched();
      this.reportError('Selecciona un participante con nombre y cargo registrados');
      return;
    }
    const value = this.participantForm.getRawValue();
    const participant: InventoryAdjustmentParticipant = {
      name: value.name.trim(), position: value.position.trim(),
      personId: this.selectedParticipant()?.idPersona,
    };
    const index = this.editingParticipantIndex();
    const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    if (this.participants().some((item, position) => position !== index && (
      (participant.personId != null && item.personId === participant.personId) ||
      (normalize(item.name) === normalize(participant.name) && normalize(item.position) === normalize(participant.position))
    ))) {
      this.reportError('Esta persona ya está incluida en los participantes');
      return;
    }
    this.participants.update((items) =>
      index === null
        ? [...items, participant]
        : items.map((item, position) => (position === index ? participant : item)),
    );
    this.clearParticipant();
  }

  editParticipant(index: number) {
    const participant = this.participants()[index];
    if (!participant) return;
    this.personRequest?.unsubscribe();
    this.people.set([]);
    this.selectedParticipant.set({ idPersona: participant.personId,
      nombreCompleto: participant.name, cargo: { nombre: participant.position } });
    this.editingParticipantIndex.set(index);
    this.participantForm.reset(participant);
    this.participantForm.markAsDirty();
  }

  removeParticipant(index: number) {
    this.participants.update((items) => items.filter((_, position) => position !== index));
    this.clearParticipant();
  }

  clearParticipant() {
    this.personRequest?.unsubscribe();
    this.people.set([]);
    this.selectedParticipant.set(null);
    this.editingParticipantIndex.set(null);
    this.participantForm.reset();
  }

  save() {
    if (this.saving() || this.loading() || this.loadFailed()) return;
    this.reportError('');
    if (this.form.invalid || !this.details().length) {
      this.form.markAllAsTouched();
      this.reportError('Completa la información general y agrega al menos un detalle de conteo.');
      return;
    }
    if (this.detailForm.dirty || this.participantForm.dirty) {
      this.reportError(
        'Agrega los datos pendientes del participante o del conteo, o limpia esos formularios antes de guardar.',
      );
      return;
    }
    if (
      this.details().some(
        (detail) =>
          !Number.isInteger(detail.countedQuantity) ||
          detail.countedQuantity < 0 ||
          !Number.isInteger(detail.inventoryQuantity) ||
          detail.inventoryQuantity < 0 ||
          detail.entryDetailId <= 0 ||
          detail.warehouseId <= 0,
      )
    ) {
      this.reportError(
        'Revisa las existencias, cantidades y almacenes de los detalles antes de guardar.',
      );
      return;
    }
    const dto = InventoryAdjustmentMapper.toSaveDto(
      this.form.getRawValue(),
      this.participants(),
      this.details(),
    );
    this.saving.set(true);
    this.service
      .saveAdjustment(dto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          this.alert.success('Conciliación guardada');
          this.router.navigate(['/layout/conciliaciones/Ajuste-de-inventario']);
        },
        error: () =>
          this.reportError(
            'No se pudo guardar la conciliación. Los datos se conservan para volver a intentar.',
          ),
      });
  }
}
