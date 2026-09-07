import { Component, inject, OnInit } from '@angular/core';
import { NameDescriptionColumns } from '../../../../shared/constant/table-columns';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { DeliveryTypeService } from '../../services/deliveryType/delivery-type-service';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';

@Component({
  selector: 'app-delivery-type',
  imports: [TableOfContent, ReactiveFormsModule, InputFilter, FormActions],
  templateUrl: './delivery-type.html',
  styleUrl: './delivery-type.css',
})
export class DeliveryType extends BaseCrud<any> implements OnInit{
  
  tableColumns = NameDescriptionColumns
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private deliveryTypeService = inject(DeliveryTypeService);
  override getService() { return this.deliveryTypeService }
  
  loading = this.loadingService.loading
  delivery_type_form = this.fb.nonNullable.group({
    idTipoEntrega: [0],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required]
  });

  constructor() { super(); }
  ngOnInit(): void { this.loadData()}
}
