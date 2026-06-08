import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-catalog-dialog',
  imports: [],
  templateUrl: './catalog-dialog.html',
  styleUrl: './catalog-dialog.css',
})
export class CatalogDialog {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<CatalogDialog>);

  closeDialog() {
    this.dialogRef.close()
  }
}

