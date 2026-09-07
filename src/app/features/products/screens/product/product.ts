import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';
import { ProductsColumns } from '../../../../shared/constant/table-columns';
import { ProductService } from '../../services/product/product-service';
import { Loading } from '../../../../core/service/loading-service/loading';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { ProductDetailDialog } from '../../dialog/product-detail-dialog/product-detail-dialog';
import { ProductFacade } from '../../facades/product-facade';
import { ProductForms } from '../../forms/product-form';
import { ProductModel } from '../../model/productModel';

@Component({
  selector: 'app-product',
  imports: [TableOfContent, CreateConditionalBox, FormActions, ReactiveFormsModule, SearchSelect],
  templateUrl: './product.html',
  providers:[ProductFacade],
  styleUrl: './product.css',
})
export class Product extends BaseCrud<any> implements OnInit {

  tableColumns = ProductsColumns
  creatingProduct = signal(false);
  filteringProduct = signal(false);

  facade = inject(ProductFacade);
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private dialogService = inject(DialogService);
  private productService = inject(ProductService);

  filterForm = ProductForms.filters(this.fb);
  productForm = ProductForms.create(this.fb);

  override getService() { return this.productService }

  loading = this.loadingService.loading
  
  constructor() { super(); }
  ngOnInit(): void {
    this.loadData()
    this.facade.loadSelections();
  }

  openDialog(data: any) { this.dialogService.open(ProductDetailDialog, data) }

  toggleFilters() {
    this.filteringProduct.update(v => !v);

    if (this.filteringProduct()) {
      this.creatingProduct.set(false);
    }
  }

  toggleCreate() {
    this.creatingProduct.update(v => !v);

    if (this.creatingProduct()) {
      this.filteringProduct.set(false);
    }
  }

  editProduct(product: ProductModel) {
    this.creatingProduct.set(true);
    this.filteringProduct.set(false);
    this.facade.setSelections(product);

    this.productForm.patchValue(
      ProductForms.toEditValue(product)
    );
  }

  clearForm() {
    this.productForm.reset();
    this.filterForm.reset();
    this.facade.clearSelections();
  }
}
