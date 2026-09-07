import { Component, inject, OnInit, signal } from '@angular/core';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { StockEntryService } from '../../services/stock-entry-service';
import { RouterLink } from '@angular/router';
import { EntryColumns } from '../../../../shared/constant/table-columns';
import { EntriesFacade } from '../../facades/entries-facade';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { StockEntryFiltersForms } from '../../forms/stock-entry-filter-fomr';
import { EntryDetails } from '../../dialog/entry-details/entry-details';

@Component({
  selector: 'app-entries',
  imports: [SearchSelect, TableOfContent, FormActions, CreateConditionalBox, RouterLink, ReactiveFormsModule],
  templateUrl: './entries.html',
  styleUrl: './entries.css',
  providers: [EntriesFacade]
})
export class Entries extends BaseCrud<any> implements OnInit {

  tableColumns = EntryColumns
  filteringentries = signal(false);

  facade = inject(EntriesFacade);

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private dialogService = inject(DialogService);
  private entryService = inject(StockEntryService);

  loading = this.loadingService.loading
  filterForm = StockEntryFiltersForms.filters(this.fb);

  override getService() { return this.entryService }

  constructor() { super(); }
  ngOnInit(): void {
    this.facade.loadData()
    this.loadDataPost(body => this.entryService.getFiltersEntries(body), {});
  }

  openDialog(id: number) { this.dialogService.open(EntryDetails, id) }
}
