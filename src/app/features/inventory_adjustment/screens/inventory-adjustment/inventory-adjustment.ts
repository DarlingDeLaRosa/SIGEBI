import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { InventoryAdjustmentColumns } from '../../../../shared/constant/table-columns';
import { InventoryAdjustmentFacade } from '../../facades/inventory-adjustment-facade';
import { InventoryAdjustmentReferenceFacade } from '../../facades/inventory-adjustment-reference-facade';
import { InventoryAdjustmentForms } from '../../forms/inventory-adjustment-forms';
import { InventoryAdjustmentMapper } from '../../mappers/inventory-adjustment-mapper';
import { ProductOptionDto, WarehouseDto } from '../../DTOs/inventory-adjustment-dto';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { InventoryAdjustmentDetailDialog } from '../../dialog/inventory-adjustment-detail-dialog/inventory-adjustment-detail-dialog';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';

@Component({
  selector: 'app-inventory-adjustment',
  imports: [ReactiveFormsModule, RouterLink, SearchSelect, TableOfContent, FormActions],
  providers: [InventoryAdjustmentFacade, InventoryAdjustmentReferenceFacade],
  templateUrl: './inventory-adjustment.html',
  styleUrl: './inventory-adjustment.css',
})
export class InventoryAdjustment implements OnInit  {

  readonly facade = inject(InventoryAdjustmentFacade);
  readonly references = inject(InventoryAdjustmentReferenceFacade);
  private readonly dialog = inject(DialogService);
  readonly filterForm = InventoryAdjustmentForms.filters(inject(FormBuilder));
  readonly tableColumns = InventoryAdjustmentColumns;
  readonly showFilters = signal(false);
  readonly selectedWarehouse = signal<WarehouseDto | null>(null);
  readonly selectedProduct = signal<ProductOptionDto | null>(null);

  readonly rows = computed(() =>
    (this.facade.data()?.data ?? []).map((row) => ({
      ...row,
      campusName:
        this.references.campuses().find((campus) => campus.idRecinto === row.campusId)?.nombre ??
        row.campusId,
    })),
  );

  ngOnInit() {
    this.references.load();
    this.facade.loadData();
  }

  toggleFilters() {
    this.showFilters.update((value) => !value);
  }

  changePageSize(event: Event) {
    this.facade.changePageSize(Number((event.target as HTMLSelectElement).value));
  }

  applyFilters() {
    this.facade.applyFilters(InventoryAdjustmentMapper.filters(this.filterForm.getRawValue()));
  }

  selectWarehouse(item: WarehouseDto | null) {
    this.selectedWarehouse.set(item || null);
    this.filterForm.patchValue({ warehouseId: item?.idTipoAlm ?? null });
    this.filterForm.markAsDirty();
  }

  selectProduct(item: ProductOptionDto | null) {
    this.selectedProduct.set(item || null);
    this.filterForm.patchValue({ productId: item?.idProducto ?? null });
    this.filterForm.markAsDirty();
  }

  clearFilters() {
    this.filterForm.reset();
    this.selectedWarehouse.set(null);
    this.selectedProduct.set(null);
    this.applyFilters();
  }

  openDetail(id: number) {
    this.dialog.open(InventoryAdjustmentDetailDialog, id, '1100px');
  }
}
