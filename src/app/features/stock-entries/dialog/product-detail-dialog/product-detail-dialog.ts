import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-product-detail-dialog',
  imports: [CommonModule],
  templateUrl: './product-detail-dialog.html',
  styleUrl: './product-detail-dialog.css',
})
export class ProductDetailDialog {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ProductDetailDialog>);

  closeDialog() {
    console.log(this.data);
    
    this.dialogRef.close()
  }
}
