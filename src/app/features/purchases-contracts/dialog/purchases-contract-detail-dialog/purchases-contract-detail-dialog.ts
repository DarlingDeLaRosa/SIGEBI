import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PurchaseContractDetailFacade } from '../../facades/purchases-contract-detail-facade';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-purchases-contract-detail-dialog',
  imports: [CommonModule, Skeleton],
  templateUrl: './purchases-contract-detail-dialog.html',
  styleUrl: './purchases-contract-detail-dialog.css',
  providers: [PurchaseContractDetailFacade],
})
export class PurchasesContractDetailDialog implements OnInit {
  id = inject(MAT_DIALOG_DATA);
  facade = inject(PurchaseContractDetailFacade);
  dialogRef = inject(MatDialogRef<PurchasesContractDetailDialog>);

  ngOnInit() { this.facade.load(this.id) }
  closeDialog() { this.dialogRef.close() }
}
