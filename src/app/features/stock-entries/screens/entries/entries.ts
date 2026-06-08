import { Component, inject } from '@angular/core';
import { TableOfContent } from '../../../../components/table-of-content/table-of-content';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { StockEntryService } from '../../services/stock-entry-service';
import { RouterLink } from '@angular/router';
import { EntryColumns } from '../../../../shared/table-columns';

@Component({
  selector: 'app-entries',
  imports: [TableOfContent, RouterLink],
  templateUrl: './entries.html',
  styleUrl: './entries.css',
})
export class Entries extends BaseCrud<any> {

  tableColums = EntryColumns
  filteringProduct: boolean = false

  constructor() { super(); }
  private entryService = inject(StockEntryService);
  override getService() { return this.entryService }

}
