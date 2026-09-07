import { Component, inject, OnInit } from '@angular/core';
import { Loading } from '../../../../core/service/loading-service/loading';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { WarehouseNameService } from '../../services/warehouseName/warehouse-name-service';
import { NameColumns } from '../../../../shared/constant/table-columns';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';

@Component({
  selector: 'app-warehouse-names',
  imports: [TableOfContent, ReactiveFormsModule, InputFilter, FormActions],
  templateUrl: './warehouse-names.html',
  styleUrl: './warehouse-names.css',
})
export class WarehouseNames extends BaseCrud<any> implements OnInit {
  
  tableColumns = NameColumns
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private wareHouseNameService = inject(WarehouseNameService);
  override getService() { return this.wareHouseNameService }
  
  loading = this.loadingService.loading
  warehouse_names_form = this.fb.nonNullable.group({
    idTipoAlm: [],
    nombre: ['', Validators.required]
  });

  constructor() { super(); }
  ngOnInit(): void { this.loadData()}
}
