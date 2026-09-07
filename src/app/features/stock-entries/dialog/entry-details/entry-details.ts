import { Component, inject, OnInit } from '@angular/core';
import { EntryDetailFacade } from '../../facades/entry-detail-facade';
import { CommonModule } from '@angular/common';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-entry-details',
  imports: [CommonModule, Skeleton],
  templateUrl: './entry-details.html',
  styleUrl: './entry-details.css',
  providers: [EntryDetailFacade],
})
export class EntryDetails implements OnInit {
  id = inject(MAT_DIALOG_DATA);
  facade = inject(EntryDetailFacade);

  ngOnInit(): void {
    this.facade.load(this.id);
  }

  closeDialog(): void { // cerrar modal
  }
} 