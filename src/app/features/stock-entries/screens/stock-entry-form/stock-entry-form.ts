import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { StockEntryService } from '../../services/stock-entry-service';
import { StockEntryForms } from '../../forms/stock-entry-forms';
import { Loading } from '../../../../core/service/loading-service/loading';
import { EntryDetailsColumns, PurchaseContractListSummary, PurchaseContractProductsColumnsSummary } from '../../../../shared/constant/table-columns';
import { SectionBox } from '../../../../shared/components/section-box/section-box';
import { EntriesManagementFacade } from '../../facades/entries-management-facade';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';

@Component({
  selector: 'app-stock-entry-form',
  imports: [CommonModule, RouterLink, FormsModule, SearchSelect, FormActions, TableOfContent, ReactiveFormsModule, SectionBox],
  templateUrl: './stock-entry-form.html',
  styleUrl: './stock-entry-form.css',
  providers: [EntriesManagementFacade]
})
export class StockEntryForm extends BaseCrud<any> implements OnInit {

  purchaseContract: any;  

  noOrden: string = ''
  tableColumns = EntryDetailsColumns
  tableColumsPurchases = PurchaseContractListSummary
  tableColumsDetailPurchases = PurchaseContractProductsColumnsSummary

  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);
  facade = inject(EntriesManagementFacade);

  loading = this.loadingService.loading
  stockEntryForm = StockEntryForms.createForm(this.fb);
  stockEntryDetailForm = StockEntryForms.createDetailForm(this.fb);

  private stockEntryService = inject(StockEntryService);
  override getService() { return this.stockEntryService }

  constructor() {
    super();

    effect(() => {
      const purchaseContract = this.facade.purchaseContractById();

      if (!purchaseContract) return;

      this.stockEntryForm.patchValue({
        idOrdenCompra: purchaseContract.id,
        idProveedor: purchaseContract.idProveedor,
        total: purchaseContract.total
      });
    });

    effect(() => {
      const detail = this.facade.selectedDetail();
      
      if (!detail) return;

      this.stockEntryDetailForm.patchValue({
        idProducto: detail.idProducto,
        cantidad: detail.calCantidad,
        precio: detail.productoObj.precio,
        itbisProducto: detail.productoObj.itbis,
        idDetalleOrden: detail.idOrdenCompra,
        nombre: detail.productoObj.nombre,
      });
    });
  }

  ngOnInit(): void {
    this.purchaseContract = history.state.purchaseContract;
    if (this.purchaseContract) {
      this.facade.loadPurchaseContractById(this.purchaseContract.row.id)
    }

    this.facade.loadData()
  }

  override save(): void {

    if (this.stockEntryForm.invalid || this.facade.details().length == 0) {
      this.stockEntryForm.markAllAsTouched();
      return;
    }

    const dto = this.facade.buildCreateDto(
      this.stockEntryForm
    );

    super.save(
      this.stockEntryForm,
      'id',
      () => {
        this.facade.clearDetails();
        this.facade.clearGeneralSelections();
        this.facade.clearDetailsSelections();
        this.facade.clearPurchaseContract();
      },
      dto
    );
  }
}
