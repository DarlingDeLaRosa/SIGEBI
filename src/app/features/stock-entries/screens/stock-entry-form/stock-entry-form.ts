import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
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

  showPurchaseContrat: boolean = true
  showListPurchaseContratDetails: boolean = true
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
  private readonly destroyRef = inject(DestroyRef);
  readonly saving = signal(false);
  override getService() { return this.stockEntryService }

  constructor() {
    super();

    effect(() => {
      const purchaseContract = this.facade.purchaseContractById();

      if (!purchaseContract) return;

      this.stockEntryForm.patchValue({
        idOrdenCompra: purchaseContract.id,
        idProveedor: purchaseContract.idProveedor,
        total: this.stockEntryForm.controls.id.value ? this.stockEntryForm.controls.total.value : purchaseContract.total
      });
    });

    effect(() => {
      const detail = this.facade.selectedDetail();

      if (!detail) return;

      this.stockEntryDetailForm.patchValue({
        idProducto: detail.idProducto,
        cantidad: this.facade.pendingQuantity() ?? 0,
        precio: detail.productoObj.precio,
        itbisProducto: detail.productoObj.itbis,
        idDetalleOrden: detail.idOrdenCompra,
        nombre: detail.productoObj.nombre,
      });
    });
  }

  ngOnInit(): void {
    const purchaseContract = history.state?.purchaseContract;
    const idEntry = history.state?.idEntrada;

    if (purchaseContract) { this.facade.loadPurchaseContractById(purchaseContract.row.id) }

    if (idEntry) {
      this.showPurchaseContrat = false
      this.showListPurchaseContratDetails = false
      
      this.loadById(idEntry, (data) => {
        this.facade.sectionOpenGeneral.set(true);
        this.facade.loadStockEntryHead(data, this.stockEntryForm)
      })
    }

    this.facade.loadData()
  }

  override save(): void {
    if (this.saving()) return;

    if (this.stockEntryForm.invalid || this.facade.details().length == 0) {
      this.stockEntryForm.markAllAsTouched();
      return;
    }
    if (!this.facade.validateDetails()) return;

    const dto = this.facade.buildCreateDto(
      this.stockEntryForm
    );

    const request = dto.id > 0 ? this.stockEntryService.update(dto) : this.stockEntryService.create(dto);
    this.saving.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false))).subscribe({
      next: response => {
        if (response?.success === false) {
          this.alert.error(response.message || 'No se pudo guardar la entrada.');
          return;
        }
        this.facade.clearDetails();
        this.facade.clearGeneralSelections();
        this.facade.clearDetailsSelections();
        this.facade.clearPurchaseContract();
        this.stockEntryForm.reset();
        this.alert.success('Registro guardado');
      },
      error: error => this.alert.error(error.error?.message || 'No se pudo guardar la entrada. Verifica el saldo pendiente.'),
    });
  }
}
