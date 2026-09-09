import { Component, inject, OnInit } from '@angular/core';
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
  readonly detailColumns = InventoryAdjustmentDetailColumns;
  readonly participantColumns = InventoryAdjustmentParticipantColumns;

  ngOnInit() {
    this.references.load();
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      const adjustmentId = Number(id);
      if (!Number.isInteger(adjustmentId) || adjustmentId <= 0) {
        this.facade.loadFailed.set(true);
        this.facade.error.set('El identificador de la conciliación no es válido.');
      } else {
        this.facade.load(adjustmentId);
      }
    }
  }

  campusName() {
    const id = this.facade.form.controls.campusId.value;
    return this.references.campuses().find((campus) => campus.idRecinto === id)?.nombre ?? id;
  }
}
