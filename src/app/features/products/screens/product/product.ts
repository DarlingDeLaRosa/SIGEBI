import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { SearchSelect } from '../../../../components/search-select/search-select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormActions } from '../../../../components/form-actions/form-actions';
import { TableOfContent } from '../../../../components/table-of-content/table-of-content';
import { CreateConditionalBox } from '../../../../components/create-conditional-box/create-conditional-box';
import { ProductsColumns } from '../../../../shared/table-columns';
import { ProductService } from '../../services/product/product-service';
import { Loading } from '../../../../core/service/loading-service/loading';
import { UnitOfMeasureService } from '../../../maintenance/services/unitOfMeasure/unit-of-measure-service';
import { ProductTypeService } from '../../../maintenance/services/productType/product-type-service';
import { CatalogService } from '../../../maintenance/services/catalog/catalog-service';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { ProductDetailDialog } from '../../../stock-entries/dialog/product-detail-dialog/product-detail-dialog';

@Component({
  selector: 'app-product',
  imports: [TableOfContent, CreateConditionalBox, FormActions, ReactiveFormsModule, SearchSelect],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product extends BaseCrud<any> implements OnInit {

  tableColums = ProductsColumns
  creatingProduct: boolean = false
  filteringProduct: boolean = false

  unitsOfMeasure = signal<any[]>([]);
  productType = signal<any[]>([]);
  catalog = signal<any[]>([]);

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private productService = inject(ProductService);
  private dialogService = inject(DialogService);

  private unitsOfMeasureService = inject(UnitOfMeasureService);
  private productTypeService = inject(ProductTypeService);
  private catalogService = inject(CatalogService);

  override getService() { return this.productService }

  loading = this.loadingService.loading

  formSelections = {
    productType: signal<any | null>(null),
    catalog: signal<any | null>(null),
    unitOfMeasure: signal<any | null>(null),
  };

  filterSelections = {
    productType: signal<any | null>(null),
    catalog: signal<any | null>(null),
  };

  filter_form = this.fb.nonNullable.group({
    filter: [''],
    idCatalogo: [],
    idTipoArticulo: [],
  });

  product_form = this.fb.nonNullable.group({
    idProducto: [0],
    nombre: ['', Validators.required],
    precio: [, Validators.required],
    itbis: [, Validators.required],
    idCatalogo: [, Validators.required],
    descripcion: ['', Validators.required],
    stockMinimo: [, Validators.required],
    idUnidadMe: [, Validators.required],
    idTipoArt: [, Validators.required],
  });

  constructor() { super(); }
  ngOnInit(): void {
    this.loadData()
    this.getUnitsOfMeasure()
    this.getProductType()
    this.getCatalog()
  }

  openDialog(data: any) { this.dialogService.open(ProductDetailDialog, data) }

  toggleFilters() {
    this.filteringProduct = !this.filteringProduct;
    if (this.filteringProduct) { this.creatingProduct = false; }
  }

  toggleCreate() {
    this.creatingProduct = !this.creatingProduct;
    if (this.creatingProduct) { this.filteringProduct = false; }
  }

  getUnitsOfMeasure(text: string = ' ') {
    this.loadSelect(() => this.unitsOfMeasureService.getAll({ filter: text, page: 1, CantItems: 10 }), this.unitsOfMeasure);
  }

  getProductType(text: string = ' ') {
    this.loadSelect(() => this.productTypeService.getAll({ filter: text, page: 1, CantItems: 10 }), this.productType);
  }

  getCatalog(text: string = ' ') {
    this.loadSelect(() => this.catalogService.getAll({ filter: text, page: 1, CantItems: 10 }), this.catalog);
  }

  setProduct(product: any) {

    this.creatingProduct = true;
    this.filteringProduct = false;

    this.formSelections.unitOfMeasure.set(product.unidadMedidaObj);
    this.formSelections.productType.set(product.tipoArticuloObj);
    this.formSelections.catalog.set(product.catalogoObj);

    this.setEditForm(
      this.product_form,
      {
        ...product,
        idCatalogo: product.catalogoObj.id,
        idTipoArt: product.tipoArticuloObj.idTipoArt,
        idUnidadMe: product.unidadMedidaObj.idUnidadMe
      }
    );
  }

  clearForm() {
    this.product_form.reset();
    this.filter_form.reset();

    this.formSelections.catalog.set(null);
    this.formSelections.productType.set(null);
    this.formSelections.unitOfMeasure.set(null);

    this.filterSelections.catalog.set(null);
    this.filterSelections.productType.set(null);
  }
}
