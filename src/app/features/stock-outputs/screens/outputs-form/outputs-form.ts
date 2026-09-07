import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionBox } from '../../../../shared/components/section-box/section-box';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { CommonModule } from '@angular/common';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { OutputColumns } from '../../../../shared/constant/table-columns';
import { Loading } from '../../../../core/service/loading-service/loading';
import { StockOutputsForms } from '../../forms/stock-outputs-forms';
import { OutputService } from '../../services/output-service';
import { OutputsManagementFacade } from '../../facades/outputs-managment-facade';

@Component({
  selector: 'app-outputs-form',
  imports: [CommonModule, RouterLink, SearchSelect, FormActions, TableOfContent, ReactiveFormsModule, SectionBox],
  templateUrl: './outputs-form.html',
  styleUrl: './outputs-form.css',
  providers: [OutputsManagementFacade]
})
export class OutputsForm extends BaseCrud<any> implements OnInit {

  noOrden: string = ''
  tableColumns = OutputColumns

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  facade = inject(OutputsManagementFacade);

  loading = this.loadingService.loading
  stockOutputForm = StockOutputsForms.createForm(this.fb);
  stockOutputDetailForm = StockOutputsForms.createDetailForm(this.fb);

  private stockOutputsService = inject(OutputService);
  override getService() { return this.stockOutputsService }

  constructor() { super(); }

  ngOnInit(): void { this.facade.loadData() }

  // override save(): void {

  //   if (this.stockOutputForm.invalid || this.facade.details().length == 0) {
  //     this.stockOutputForm.markAllAsTouched();
  //     return;
  //   }

  //   const dto = this.facade.buildCreateDto(
  //     this.stockOutputForm
  //   );

  //   super.save(
  //     this.stockOutputForm,
  //     'id',
  //     () => {
  //       this.facade.clearDetails();
  //       this.facade.clearGeneralSelections();
  //       this.facade.clearDetailsSelections();
  //       this.facade.clearPurchaseContract();
  //     },
  //     dto
  //   );
  // }
}
