import { Component, inject, OnInit, signal } from '@angular/core';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { PurchaseContractService } from '../../services/purchase-contract-service';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';
import { PurchaseContractList } from '../../../../shared/constant/table-columns';
import { Loading } from '../../../../core/service/loading-service/loading';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { PurchaseContractFacade } from '../../facades/purchases-contract-facade';
import { PurchaseContractFiltersForms } from '../../forms/purchases-contracts';
import { PurchasesContractDetailDialog } from '../../dialog/purchases-contract-detail-dialog/purchases-contract-detail-dialog';
import { PurchaseContractReferenceFacade } from '../../facades/purchases-contract-reference-facade';

@Component({
  selector: 'app-purchase-contract',
  imports: [SearchSelect, TableOfContent, FormActions, CreateConditionalBox, RouterLink, ReactiveFormsModule],
  templateUrl: './purchase-contract.html',
  providers: [PurchaseContractFacade, PurchaseContractReferenceFacade],
  styleUrl: './purchase-contract.css',
})
export class PurchaseContract extends BaseCrud<any> implements OnInit {

  tableColumns = PurchaseContractList
  filteringPurchasesContracts = signal(false);

  facade = inject(PurchaseContractFacade);
  facadeReference = inject(PurchaseContractReferenceFacade);

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  private dialogService = inject(DialogService);
  private purchaseContract = inject(PurchaseContractService);

  loading = this.loadingService.loading
  filterForm = PurchaseContractFiltersForms.filters(this.fb);

  override getService() { return this.purchaseContract }

  constructor() { super(); }
  ngOnInit(): void {
    this.loadData()
    this.facadeReference.loadSupplier()
  }

  openDialog(id: number) { this.dialogService.open(PurchasesContractDetailDialog, id) }
  clearForm() { this.filterForm.reset(); this.facadeReference.clearSelections(); this.loadData() }
}
