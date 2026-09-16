import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';
import { TransferColumns } from '../../../../shared/constant/table-columns';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { TransferFacade } from '../../facades/transfer-facade';
import { TransferFilterForm } from '../../forms/transfer-filter-form';
import { TransferModel } from '../../model/transfer-model';
import { TransferService } from '../../services/transfer-service';
import { TransferDetailDialog } from '../../dialog/transfer-detail-dialog/transfer-detail-dialog';

@Component({
  selector: 'app-transfers',
  imports: [ReactiveFormsModule, TableOfContent, FormActions, CreateConditionalBox],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
  providers: [TransferFacade],
})
export class Transfers extends BaseCrud<TransferModel> implements OnInit {
  readonly facade = inject(TransferFacade);
  private readonly service = inject(TransferService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  private request?: Subscription;
  readonly filterForm = TransferFilterForm.create(inject(FormBuilder));
  readonly tableColumns = TransferColumns;

  override getService() {
    return this.service;
  }
  // Search is submitted explicitly so the same filter can be retained during pagination.
  override filterResults() {}

  ngOnInit() {
    this.loadData();
  }

  override loadData() {
    this.request?.unsubscribe();
    this.facade.loading.set(true);
    this.facade.error.set('');
    const pagination = this.pagination();
    this.request = this.service
      .getAll({
        filter: this.facade.activeFilter(),
        page: pagination.currentPage,
        CantItems: pagination.pageSize,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.facade.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.data.set(response);
          this.facade.hasKnownTotal.set(response.totalItems !== null);
          this.pagination.set({
            currentPage: response.currentPage,
            pageSize: response.cantItem,
            totalPages: response.cantPage,
            totalItems: response.totalItems ?? 0,
          });
        },
        error: () => {
          this.data.set(null);
          this.facade.error.set('No se pudieron cargar las transferencias. Intenta nuevamente.');
        },
      });
  }

  applyFilters() {
    this.facade.activeFilter.set(this.filterForm.controls.filter.value.trim());
    this.pagination.update((value) => ({ ...value, currentPage: 1 }));
    this.loadData();
  }

  clearForm() {
    this.filterForm.reset();
    this.applyFilters();
  }

  openDetail(transfer: TransferModel) {
    this.dialog.open(TransferDetailDialog, transfer, '900px');
  }
}
