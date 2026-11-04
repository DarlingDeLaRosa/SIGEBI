import { Component, DestroyRef, inject, OnInit, signal, viewChildren, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { OutputQuery, OutputService } from '../../services/output-service';
import { OutputColumns } from '../../../../shared/constant/table-columns';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { Loading } from '../../../../core/service/loading-service/loading';
import { OutputDetail } from '../../dialog/output-detail/output-detail';
import { OutputModel } from '../../model/output-model';
import { OutputsFacade } from '../../facades/outputs-facade';
import { OutputFilterForms } from '../../forms/output-filter-form';
import { OutputFilters } from '../../DTOs/output-filters';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';

@Component({
  selector: 'app-outputs',
  imports: [TableOfContent, RouterLink, ReactiveFormsModule, CreateConditionalBox, SearchSelect, FormActions],
  providers: [OutputsFacade],
  templateUrl: './outputs.html',
  styleUrl: './outputs.css',
})
export class Outputs extends BaseCrud<OutputModel> implements OnInit {
  readonly tableColumns = OutputColumns;
  readonly filteringOutput = signal(false);
  readonly facade = inject(OutputsFacade);
  readonly filterForm = OutputFilterForms.create(inject(FormBuilder));
  readonly loading = inject(Loading).loading;
  readonly loadingList = signal(false);
  private outputService = inject(OutputService);
  private dialogService = inject(DialogService);
  private destroyRef = inject(DestroyRef);
  private listRequest?: Subscription;
  private appliedFilters: Partial<OutputFilters> = {};
  private catalogsLoaded = false;
  private filterSelects = viewChildren(SearchSelect);

  override getService() { return this.outputService; }
  override filterResults() {}

  ngOnInit() { this.loadData(); }

  override loadData(params: OutputQuery = {}) {
    this.listRequest?.unsubscribe();
    this.loadingList.set(true);
    const { currentPage, pageSize } = this.pagination();
    this.listRequest = this.outputService.getAll({ page: currentPage, CantItems: pageSize, ...this.appliedFilters, ...params })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingList.set(false))).subscribe({
        next: response => {
          this.data.set(response);
          this.pagination.set({ currentPage: response.currentPage, pageSize: response.cantItem,
            totalPages: response.cantPage, totalItems: response.totalItems ?? 0 });
        },
        error: () => this.alert.error('No se pudieron cargar las salidas. Intenta nuevamente'),
      });
  }

  toggleFilters() {
    this.filteringOutput.update(value => !value);
    if (this.filteringOutput() && !this.catalogsLoaded) {
      this.catalogsLoaded = true;
      this.facade.loadCatalogs();
    }
  }

  applyFilters() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.alert.error('La fecha desde debe ser igual o anterior a la fecha hasta');
      return;
    }
    const values = this.filterForm.getRawValue();
    this.appliedFilters = { ...values, desde: values.desde ? `${values.desde}T00:00:00` : null,
      hasta: values.hasta ? `${values.hasta}T23:59:59.999` : null };
    this.pagination.update(value => ({ ...value, currentPage: 1 }));
    this.loadData();
  }

  selectFilter<T>(selection: WritableSignal<T | null>, control: string, item: T | null, field: keyof T) {
    selection.set(item || null);
    this.filterForm.patchValue({ [control]: item ? item[field] : null });
    this.filterForm.markAsDirty();
  }

  clearFilters() {
    this.filterForm.reset();
    this.facade.clearSelections();
    this.filterSelects().forEach(select => select.clear());
    this.applyFilters();
  }

  openDetail(id: number) { this.dialogService.open(OutputDetail, id); }
}
