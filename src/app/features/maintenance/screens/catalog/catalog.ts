import { Component, inject, OnInit, signal } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { CatalogService } from '../../services/catalog/catalog-service';
import { CatalogColumns } from '../../../../shared/constant/table-columns';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { CatalogDialog } from '../../dialog/catalog-dialog/catalog-dialog';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';

@Component({
  selector: 'app-catalog',
  imports: [TableOfContent, ReactiveFormsModule, FormActions, InputFilter, SearchSelect],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog extends BaseCrud<any> implements OnInit {

  tableColumns = CatalogColumns

  auxiliar = signal<any[]>([]);
  auxiliarSelected = signal<any | null>(null);

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private catalogService = inject(CatalogService);
  private dialogService = inject(DialogService);
  override getService() { return this.catalogService }

  loading = this.loadingService.loading
  catalog_form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    definicionProducto: ['', Validators.required],
    sinonimos: [''],
    auxiliar: ['', Validators.required],
    id: [0],
  });

  constructor() { super() }
  ngOnInit(): void {
    this.loadData();
    this.getAuxiliar('');
  }
  
  openDialog(data: any) { this.dialogService.open(CatalogDialog, data) }

  getAuxiliar(text: string = ' ') {
    this.loadSelect(() => this.catalogService.getAuxiliary(text), this.auxiliar);
  }

  setAuxiliar(item: any) {
    this.auxiliarSelected.set(item);
    this.catalog_form.markAllAsDirty();
    this.catalog_form.patchValue({ auxiliar: item.id });
  }

  setCatalogData($event: any) {
    this.setEditForm(
      this.catalog_form, { ...$event, auxiliar: $event.auxiliar.id }
    );
  }
}
