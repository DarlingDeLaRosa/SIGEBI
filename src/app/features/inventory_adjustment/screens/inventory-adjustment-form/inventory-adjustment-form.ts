import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SectionBox } from '../../../../shared/components/section-box/section-box';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import {
  InventoryAdjustmentDetailColumns,
  InventoryAdjustmentParticipantColumns,
} from '../../../../shared/constant/table-columns';
import { InventoryAdjustmentFormFacade } from '../../facades/inventory-adjustment-form-facade';
import { InventoryAdjustmentReferenceFacade } from '../../facades/inventory-adjustment-reference-facade';
import { Alert } from '../../../../core/service/alert-service/alert';
import { Loading } from '../../../../core/service/loading-service/loading';
import { CampusDto } from '../../DTOs/inventory-adjustment-dto';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { EntryDetails } from '../../../stock-entries/dialog/entry-details/entry-details';
import { EntryDetailDialogData } from '../../../stock-entries/model/entry-model';

@Component({
  selector: 'app-inventory-adjustment-form',
  imports: [ReactiveFormsModule, RouterLink, SectionBox, SearchSelect, TableOfContent, FormActions],
  templateUrl: './inventory-adjustment-form.html',
  styleUrl: './inventory-adjustment-form.css',
  providers: [InventoryAdjustmentFormFacade, InventoryAdjustmentReferenceFacade],
})
export class InventoryAdjustmentForm implements OnInit {
  readonly facade = inject(InventoryAdjustmentFormFacade);
  readonly references = inject(InventoryAdjustmentReferenceFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly alert = inject(Alert);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = inject(Loading).loading;
  readonly campusSearch = signal('');
  readonly filteredCampuses = computed(() => this.references.campuses().filter(campus =>
    (campus.nombre ?? '').toLowerCase().includes(this.campusSearch().trim().toLowerCase())));
  readonly detailColumns = InventoryAdjustmentDetailColumns;
  readonly participantColumns = InventoryAdjustmentParticipantColumns;

  ngOnInit() {
    this.references.errors.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(message => this.alert.error(message));
    this.references.load();
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      const adjustmentId = Number(id);
      if (!Number.isInteger(adjustmentId) || adjustmentId <= 0) {
        this.facade.loadFailed.set(true);
        this.facade.error.set('El identificador de la conciliación no es válido.');
        this.alert.error('El identificador de la conciliación no es válido.');
      } else {
        this.facade.load(adjustmentId);
      }
    }
  }

  campusName() {
    const id = this.facade.form.controls.campusId.value;
    return this.references.campuses().find((campus) => campus.idRecinto === id)?.nombre ?? 'No disponible';
  }

  selectedCampus() {
    return this.references.campuses().find(campus => campus.idRecinto === this.facade.form.controls.campusId.value) ?? null;
  }

  selectCampus(campus: CampusDto | null) {
    this.facade.selectCampus(campus?.idRecinto ?? 0);
  }

  productSearchChanged() {
    this.references.clearProductSearch();
    this.facade.productSearchChanged();
  }

  openEntryDetail() {
    const detail = this.facade.selectedEntry();
    if (!detail) return;
    const data: EntryDetailDialogData = {
      detail,
      campusName: this.campusName(),
      warehouseName: this.facade.selectedWarehouse()?.nombre || 'No disponible',
    };
    this.dialog.open(EntryDetails, data);
  }
}
