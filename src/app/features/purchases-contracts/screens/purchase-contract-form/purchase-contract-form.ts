import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { PurchaseContractService } from '../../services/purchase-contract-service';
import { PurchaseContractProductsColumns } from '../../../../shared/constant/table-columns';
import { PurchaseContractForms } from '../../forms/purchase-management-contract';
import { PurchaseContractFormFacade } from '../../facades/purchases-contract-form-facade';
import { PurchaseContractReferenceFacade } from '../../facades/purchases-contract-reference-facade';
import { Loading } from '../../../../core/service/loading-service/loading';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { ProductDetailDialog } from '../../../products/dialog/product-detail-dialog/product-detail-dialog';
import { TableAction } from '../../../../interfaces/table-content-interface';
import { SectionBox } from '../../../../shared/components/section-box/section-box';

@Component({
  selector: 'app-purchase-contract-form',
  imports: [CommonModule, RouterLink, SearchSelect, FormActions, TableOfContent, ReactiveFormsModule, SectionBox],
  templateUrl: './purchase-contract-form.html',
  providers: [PurchaseContractFormFacade, PurchaseContractReferenceFacade],
  styleUrl: './purchase-contract-form.css',
})
export class PurchaseContractForm extends BaseCrud<any> implements OnInit {

  tableColumns = PurchaseContractProductsColumns

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);    
  private dialogService = inject(DialogService);
  facade = inject(PurchaseContractFormFacade);
  facadeReference = inject(PurchaseContractReferenceFacade);
  private purchaseService = inject(PurchaseContractService);

  loading = this.loadingService.loading 
  purchaseContractForm = PurchaseContractForms.createForm(this.fb);
  purchaseContractDetailForm = PurchaseContractForms.createDetailForm(this.fb);

  actions: TableAction[] = [
    {
      label: 'Duplicar',
      icon: 'bi bi-copy',
      class: 'item-duplicate',
      action: row => this.facade.duplicate(this.purchaseContractDetailForm, row)
    },
  ];

  constructor() {
    super();

    effect(() => {
      const purchaseContract = this.dataById();

      if (!purchaseContract) return;

      this.facade.loadPurchaseContract(purchaseContract.data, this.purchaseContractForm);
      this.setDataToEdit(purchaseContract.data);
    });
  }

  override getService() { return this.purchaseService }

  ngOnInit(): void {
    const purchaseContractId = history.state.purchaseContract;

    if (purchaseContractId) {
      this.loadById(purchaseContractId);
    }

    this.facade.loadSelections();
    this.facadeReference.loadSelections();
  }

  openDialog(data: any) { this.dialogService.open(ProductDetailDialog, data) }

  setDataToEdit(purchaseContract: any) {

    this.facadeReference.filterSelections.purchasesType.set({
      name: purchaseContract.modalidadCompra,
      value: purchaseContract.modalidadCompra
    });

    this.facadeReference.filterSelections.idProveedor.set(purchaseContract.proveedorObj);
    this.purchaseContractForm.patchValue({ idProveedor: purchaseContract.idProveedor });

    return;
  }

  productSelection($event: any) {
    this.facade.selectProduct($event, this.purchaseContractDetailForm);

    this.setSelection(
      this.facade.formSelections.idUnidadMe,
      this.purchaseContractDetailForm, 'idUnidadMe', $event.unidadMedidaObj, 'idUnidadMe', true
    )

    this.setSelection(
      this.facade.formSelections.idProducto,
      this.purchaseContractDetailForm, 'idProducto', $event, 'idProducto', true
    )
  }

  clearDetailForm() {
    this.purchaseContractDetailForm.reset();
    this.facade.clearDetailsSelections();
  }

  clearForm() {
    this.facade.clearDetailsSelections();
    this.facade.clearSelections();
    this.purchaseContractForm.reset();
    this.purchaseContractDetailForm.reset();
  }

  override save() {

    if (this.purchaseContractForm.invalid) {
      this.purchaseContractForm.markAllAsTouched();
      return;
    }

    const dto = this.facade.buildCreateDto(this.purchaseContractForm);
    super.save(
      this.purchaseContractForm, 'idOrdenCompra', () => {
        this.clearForm(), this.facadeReference.clearSelections(), this.facade.clearDetails()
      },
      dto);
  }
}
