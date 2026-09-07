import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { Loading } from '../../../../core/service/loading-service/loading';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { SupplierColumns } from '../../../../shared/constant/table-columns';
import { SuppliersService } from '../../services/supplier/suppliers-service';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-suppliers',
  imports: [TableOfContent, ReactiveFormsModule, InputFilter, FormActions, SearchSelect],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.css',
})
export class Suppliers extends BaseCrud<any> implements OnInit {

  tableColumns = SupplierColumns
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private supplierService = inject(SuppliersService);
  override getService() { return this.supplierService }

  loading = this.loadingService.loading

  suppliers = signal<any[]>([])
  rzSelected = signal('');

  suppliers_form = this.fb.nonNullable.group({
    idProveedor: [0],
    rnc: ['', Validators.required],
    razonSocial: ['', Validators.required],
    nombreComercial: ['', Validators.required],
    representante: [''],
    telRepresentante: ['']
  });

  constructor() { super(); }
  ngOnInit(): void { 
    this.loadData(); 
    this.consultSuppliers() 
    this.listenChangesRNC()
  }

  consultSuppliers(text: string = ' ') {
    this.loadSelect(() =>
      this.supplierService.getByName(text), this.suppliers);
  }

  setSupplier(supplier: any) {
    this.suppliers_form.patchValue({
      rnc: supplier.rnc,
      razonSocial: supplier.razonSocial,
      nombreComercial: supplier.nombreComercial
    }, {emitEvent: false})
    this.suppliers_form.markAllAsDirty()
  }

  listenChangesRNC() {
    this.suppliers_form.controls.rnc.valueChanges
      .pipe(
        map(rnc => rnc?.trim() || ''),
        distinctUntilChanged(),
        filter(rnc => rnc?.length === 9),
        switchMap(rnc =>
          this.supplierService.getByRNC(rnc)
        )
      )
      .subscribe(res =>
        this.setSupplier(res.data)
      );
  };

  clearForm() { this.suppliers_form.reset() }
}
