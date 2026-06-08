import { Component, inject, OnInit } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { NameDescriptionColumns } from '../../../../shared/table-columns';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { StockEntryService } from '../../services/stockEntry/stock-entry-service';
import { TableOfContent } from '../../../../components/table-of-content/table-of-content';
import { InputFilter } from '../../../../components/input-filter/input-filter';
import { FormActions } from '../../../../components/form-actions/form-actions';

@Component({
  selector: 'app-stock-entry-type',
  imports: [TableOfContent, ReactiveFormsModule, InputFilter, FormActions],
  templateUrl: './stock-entry-type.html',
  styleUrl: './stock-entry-type.css',
})
export class StockEntryType extends BaseCrud<any> implements OnInit{
  
  tableColums = NameDescriptionColumns
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private stockEntryService = inject(StockEntryService);
  override getService() { return this.stockEntryService }
  
  loading = this.loadingService.loading
  stock_entry_form = this.fb.nonNullable.group({
    idTipoEntrada: [0],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  constructor() { super(); }
  ngOnInit(): void { this.loadData()}
}
