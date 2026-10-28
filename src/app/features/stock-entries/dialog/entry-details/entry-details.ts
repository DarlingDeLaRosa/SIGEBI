import { Component, inject, OnInit } from '@angular/core';
import { EntryDetailFacade } from '../../facades/entry-detail-facade';
import { CommonModule } from '@angular/common';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EntryDetailDialogData } from '../../model/entry-model';

@Component({
  selector: 'app-entry-details',
  imports: [CommonModule, Skeleton],
  templateUrl: './entry-details.html',
  styleUrl: './entry-details.css',
  providers: [EntryDetailFacade],
})
export class EntryDetails implements OnInit {
  id = inject<number | EntryDetailDialogData>(MAT_DIALOG_DATA);
  snapshot = typeof this.id === 'number' ? null : this.id;
  facade = inject(EntryDetailFacade);
  private readonly dialogRef = inject(MatDialogRef<EntryDetails>);

  ngOnInit(): void {
    if (typeof this.id === 'number') this.facade.load(this.id);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
