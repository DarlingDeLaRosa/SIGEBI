import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { RouterLink } from '@angular/router';
import { Loading } from '../../../../core/service/loading-service/loading';
import { RequestList } from '../../../../shared/constant/table-columns';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { RequestFacade } from '../../facades/request-facade';
import { RequestFiltersForms } from '../../forms/request-filter-form';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';
import { RequestQuery, RequestsService } from '../../services/requests-service';

@Component({
  selector: 'app-requests',
  imports: [RouterLink, SearchSelect, FormActions, TableOfContent, ReactiveFormsModule, CreateConditionalBox],
  templateUrl: './requests.html',
  providers: [RequestFacade],
  styleUrl: './requests.css',
})
export class Requests extends BaseCrud<any> implements OnInit {
  tableColumns = RequestList;
  filteringRequests = signal(false);
  facade = inject(RequestFacade);
  private fb = inject(FormBuilder);
  private request = inject(RequestsService);
  private appliedFilters: RequestQuery = {};
  loading = inject(Loading).loading;
  filterForm = RequestFiltersForms.filters(this.fb);

  override getService() { return this.request; }

  ngOnInit() {
    this.facade.loadSelections();
    this.loadData();
  }

  override loadData(params: RequestQuery = {}) {
    super.loadData({ ...this.appliedFilters, ...params });
  }

  applyFilters() {
    this.appliedFilters = this.filterForm.getRawValue();
    this.pagination.update(state => ({ ...state, currentPage: 1 }));
    this.loadData();
  }

  selectFilter<T>(selection: WritableSignal<T | null>, control: string, item: T | null, field: keyof T) {
    selection.set(item || null);
    this.filterForm.patchValue({ [control]: item ? item[field] : null });
    this.filterForm.markAsDirty();
  }

  clearForm() {
    this.filterForm.reset();
    this.facade.clearSelections();
    this.applyFilters();
  }
}
