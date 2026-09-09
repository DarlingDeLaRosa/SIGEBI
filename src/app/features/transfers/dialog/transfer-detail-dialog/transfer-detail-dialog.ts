import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransferModel } from '../../model/transfer-model';

@Component({
  selector: 'app-transfer-detail-dialog',
  imports: [CommonModule],
  templateUrl: './transfer-detail-dialog.html',
  styleUrl: './transfer-detail-dialog.css',
})
export class TransferDetailDialog {
  readonly transfer = inject<TransferModel>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TransferDetailDialog>);
  close() {
    this.dialogRef.close();
  }
}
