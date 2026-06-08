import { Component, inject, OnInit } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { NameDescriptionColumns } from '../../../../shared/table-columns';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { StockOutputService } from '../../services/stockOutput/stock-output-service';
import { TableOfContent } from '../../../../components/table-of-content/table-of-content';
import { InputFilter } from '../../../../components/input-filter/input-filter';
import { FormActions } from '../../../../components/form-actions/form-actions';

@Component({
  selector: 'app-stock-output-type',
  imports: [TableOfContent, ReactiveFormsModule, InputFilter, FormActions],
  templateUrl: './stock-output-type.html',
  styleUrl: './stock-output-type.css',
})
export class StockOutputType extends BaseCrud<any> implements OnInit {
  
  tableColums = NameDescriptionColumns
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private stockOutputService = inject(StockOutputService);
  override getService() { return this.stockOutputService }
  
  loading = this.loadingService.loading
  stock_output_form = this.fb.nonNullable.group({
    idTipoSalida: [0],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  constructor() { super(); }
  ngOnInit(): void { this.loadData()}
}
