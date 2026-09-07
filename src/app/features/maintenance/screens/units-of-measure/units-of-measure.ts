import { Component, inject, OnInit } from '@angular/core';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { DescriptionColumns } from '../../../../shared/constant/table-columns';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { UnitOfMeasureService } from '../../services/unitOfMeasure/unit-of-measure-service';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';

@Component({
  selector: 'app-units-of-measure',
  imports: [TableOfContent, ReactiveFormsModule, InputFilter, FormActions],
  templateUrl: './units-of-measure.html',
  styleUrl: './units-of-measure.css',
})
export class UnitsOfMeasure extends BaseCrud<any> implements OnInit{

 tableColumns = DescriptionColumns
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private unitOfMeasureService = inject(UnitOfMeasureService);
  override getService() { return this.unitOfMeasureService }
  
  loading = this.loadingService.loading
  units_measure_form = this.fb.nonNullable.group({
    idUnidadMe: [0],
    descripcion: ['', Validators.required]
  });

  constructor() { super(); }
  ngOnInit(): void { this.loadData()}
}
