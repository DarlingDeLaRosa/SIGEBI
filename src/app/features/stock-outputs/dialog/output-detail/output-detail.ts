import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { OutputDetailFacade } from '../../facades/output-detail-facade';

@Component({
  selector: 'app-output-detail',
  imports: [CommonModule, Skeleton],
  templateUrl: './output-detail.html',
  styleUrl: './output-detail.css',
  providers: [OutputDetailFacade],
})
export class OutputDetail implements OnInit {
  id = inject<number>(MAT_DIALOG_DATA);
  facade = inject(OutputDetailFacade);
  private dialogRef = inject(MatDialogRef<OutputDetail>);

  ngOnInit() { this.facade.load(this.id); }
  closeDialog() { this.dialogRef.close(); }
}
