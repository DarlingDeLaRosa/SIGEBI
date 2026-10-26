import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { RequestDetailFacade } from '../../facades/request-detail-facade';

@Component({
  selector: 'app-request-detail',
  imports: [CommonModule, Skeleton],
  templateUrl: './request-detail.html',
  styleUrl: './request-detail.css',
  providers: [RequestDetailFacade],
})
export class RequestDetail implements OnInit {
  id = inject<number>(MAT_DIALOG_DATA);
  facade = inject(RequestDetailFacade);
  private dialogRef = inject(MatDialogRef<RequestDetail>);

  ngOnInit() { this.facade.load(this.id); }
  closeDialog() { this.dialogRef.close(); }
}
