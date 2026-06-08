import { Component, inject, OnInit } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { NameColumns } from '../../../../shared/table-columns';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { ProductTypeService } from '../../services/productType/product-type-service';
import { TableOfContent } from '../../../../components/table-of-content/table-of-content';
import { InputFilter } from '../../../../components/input-filter/input-filter';
import { FormActions } from '../../../../components/form-actions/form-actions';

@Component({
  selector: 'app-product-type',
  imports: [TableOfContent, ReactiveFormsModule, InputFilter, FormActions],
  templateUrl: './product-type.html',
  styleUrl: './product-type.css',
})
export class ProductType extends BaseCrud<any> implements OnInit{
  
  tableColums = NameColumns
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private productTypeService = inject(ProductTypeService);
  override getService() { return this.productTypeService }
  
  loading = this.loadingService.loading
  product_type_form = this.fb.nonNullable.group({
    idTipoArt: [0],
    nombre: ['', Validators.required]
  });

  constructor() { super(); }
  ngOnInit(): void { this.loadData()}
}
