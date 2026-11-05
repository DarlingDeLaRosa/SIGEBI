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
import { Loading } from '../../../../core/service/loading-service/loading';

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
  readonly loading = inject(Loading).loading;

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
        ...this.facade.activeFilters(),
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
          this.facade.error.set('No se pudieron cargar las transferencias. Intenta nuevamente.');
          this.alert.error(this.facade.error());
        },
      });
  }

  applyFilters() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.alert.error('La fecha desde debe ser igual o anterior a la fecha hasta');
      return;
    }
    const filters = this.filterForm.getRawValue();
    this.facade.activeFilters.set({
      CreadoPor: filters.CreadoPor?.trim() || null,
      Estado: filters.Estado?.trim() || null,
      Desde: filters.Desde ? `${filters.Desde}T00:00:00` : null,
      Hasta: filters.Hasta ? `${filters.Hasta}T23:59:59.999` : null,
    });
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
