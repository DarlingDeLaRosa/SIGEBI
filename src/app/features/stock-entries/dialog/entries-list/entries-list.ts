import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EntryListFacade } from '../../facades/entries-list-from-facade';
import { CommonModule } from '@angular/common';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-entries-list',
  imports: [CommonModule, Skeleton],
  templateUrl: './entries-list.html',
  styleUrl: './entries-list.css',
  providers:[EntryListFacade]
})
export class EntriesListDialog implements OnInit {
  id = inject(MAT_DIALOG_DATA);
  facade = inject(EntryListFacade);
  dialogRef = inject(MatDialogRef<EntriesListDialog>);

  ngOnInit() { this.facade.load(this.id) }
  closeDialog() { this.dialogRef.close() }
}
