import { Component, inject, OnInit, signal } from '@angular/core';
import { SectionBox } from '../../../../shared/components/section-box/section-box';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loading } from '../../../../core/service/loading-service/loading';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { RequestList } from '../../../../shared/constant/table-columns';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { RequestFacade } from '../../facades/request-facade';
import { RequestFiltersForms } from '../../forms/request-filter-form';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';

@Component({
  selector: 'app-requests',
  imports: [CommonModule, RouterLink, FormsModule, SearchSelect, FormActions, TableOfContent, ReactiveFormsModule, CreateConditionalBox],
  templateUrl: './requests.html',
  providers: [RequestFacade],
  styleUrl: './requests.css',
})
export class Requests extends BaseCrud<any> implements OnInit {
  
  tableColumns = RequestList
  filteringRequests = signal(false);

  facade = inject(RequestFacade);
  // facadeReference = inject(PurchaseContractReferenceFacade);

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private dialogService = inject(DialogService);
  // private purchaseContract = inject(PurchaseContractService);

  loading = this.loadingService.loading
  filterForm = RequestFiltersForms.filters(this.fb);

  override getService() { }

  constructor() { super(); }
  ngOnInit(): void {
    this.loadData()
  }

  // openDialog(id: number) { this.dialogService.open(PurchasesContractDetailDialog, id) }
  clearForm() { this.filterForm.reset(); this.loadData() }
}
