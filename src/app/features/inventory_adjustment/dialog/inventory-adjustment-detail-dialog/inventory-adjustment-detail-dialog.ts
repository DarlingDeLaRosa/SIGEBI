import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InventoryAdjustmentDetailFacade } from '../../facades/inventory-adjustment-detail-facade';
import { InventoryAdjustmentReferenceFacade } from '../../facades/inventory-adjustment-reference-facade';

@Component({
  selector: 'app-inventory-adjustment-detail-dialog',
  imports: [CommonModule],
  templateUrl: './inventory-adjustment-detail-dialog.html',
  styleUrl: './inventory-adjustment-detail-dialog.css',
  providers: [InventoryAdjustmentDetailFacade, InventoryAdjustmentReferenceFacade],
})
export class InventoryAdjustmentDetailDialog implements OnInit {
  readonly facade = inject(InventoryAdjustmentDetailFacade);
  readonly references = inject(InventoryAdjustmentReferenceFacade);
  private readonly id = inject<number>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<InventoryAdjustmentDetailDialog>);

  ngOnInit() {
    this.facade.load(this.id);
    this.references.load();
  }
  close() {
    this.dialogRef.close();
  }
  campusName(id: number | null) {
    return this.references.campuses().find((campus) => campus.idRecinto === id)?.nombre ?? id;
  }
}
