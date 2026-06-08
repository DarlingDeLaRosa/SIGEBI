import { Component, inject, OnInit } from '@angular/core';
import { SearchSelect } from '../../../../components/search-select/search-select';
import { TableOfContent } from '../../../../components/table-of-content/table-of-content';
import { FormActions } from '../../../../components/form-actions/form-actions';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { PurchaseContractService } from '../../purchase-contract-service';
import { CreateConditionalBox } from '../../../../components/create-conditional-box/create-conditional-box';
import { PurchaseContractColumns } from '../../../../shared/table-columns';
import { Loading } from '../../../../core/service/loading-service/loading';
import { FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-purchase-contract',
  imports: [SearchSelect, TableOfContent, FormActions, CreateConditionalBox, RouterLink],
  templateUrl: './purchase-contract.html',
  styleUrl: './purchase-contract.css',
})
export class PurchaseContract extends BaseCrud<any> implements OnInit {
  tableColums = PurchaseContractColumns
  filteringProduct: boolean = false

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);

  private purchaseContract = inject(PurchaseContractService);
  override getService() { return this.purchaseContract }

  ngOnInit(): void { }

  filter_form = this.fb.nonNullable.group({
    filter: [''],
    idCatalogo: [],
    idTipoArticulo: [],
  });
}
