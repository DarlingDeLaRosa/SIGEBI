import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { CampusDto, ProductOptionDto, WarehouseDto } from '../../DTOs/inventory-adjustment-dto';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { InventoryAdjustmentDetailDialog } from '../../dialog/inventory-adjustment-detail-dialog/inventory-adjustment-detail-dialog';
import { CreateConditionalBox } from '../../../../shared/components/create-conditional-box/create-conditional-box';
import { Alert } from '../../../../core/service/alert-service/alert';
import { Loading } from '../../../../core/service/loading-service/loading';

@Component({
  selector: 'app-inventory-adjustment',
  imports: [ReactiveFormsModule, RouterLink, SearchSelect, TableOfContent, FormActions, CreateConditionalBox],
  providers: [InventoryAdjustmentFacade, InventoryAdjustmentReferenceFacade],
  templateUrl: './inventory-adjustment.html',
  styleUrl: './inventory-adjustment.css',
})
export class InventoryAdjustment implements OnInit  {

  readonly facade = inject(InventoryAdjustmentFacade);
  readonly references = inject(InventoryAdjustmentReferenceFacade);
  private readonly dialog = inject(DialogService);
  private readonly alert = inject(Alert);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = inject(Loading).loading;
  private filterCatalogsLoaded = false;
  readonly filterForm = InventoryAdjustmentForms.filters(inject(FormBuilder));
  readonly tableColumns = InventoryAdjustmentColumns;
  readonly showFilters = signal(false);
  readonly selectedWarehouse = signal<WarehouseDto | null>(null);
  readonly selectedProduct = signal<ProductOptionDto | null>(null);
  readonly selectedCampus = signal<CampusDto | null>(null);
  readonly campusSearch = signal('');
  readonly filteredCampuses = computed(() => this.references.campuses().filter(campus =>
    (campus.nombre ?? '').toLowerCase().includes(this.campusSearch().trim().toLowerCase())));

  readonly rows = computed(() =>
    (this.facade.data()?.data ?? []).map((row) => ({
      ...row,
      campusName:
        this.references.campuses().find((campus) => campus.idRecinto === row.campusId)?.nombre ??
        'No disponible',
    })),
  );

  ngOnInit() {
    this.references.errors.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => this.alert.error(message));
    this.references.loadRecintos();
    this.facade.loadData();
  }

  toggleFilters() {
    this.showFilters.update((value) => !value);
    if (this.showFilters() && !this.filterCatalogsLoaded) {
      this.filterCatalogsLoaded = true;
      this.references.loadWarehouses();
      this.references.loadProducts();
    }
  }

  applyFilters() {
    if (this.facade.loading()) return;
    this.facade.applyFilters(InventoryAdjustmentMapper.filters(this.filterForm.getRawValue()));
  }

  selectCampus(item: CampusDto | null) {
    this.selectedCampus.set(item || null);
    this.filterForm.patchValue({ campusId: item?.idRecinto ?? null });
    this.filterForm.markAsDirty();
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
    if (this.facade.loading()) return;
    this.filterForm.reset();
    this.selectedWarehouse.set(null);
    this.selectedProduct.set(null);
    this.selectedCampus.set(null);
    this.campusSearch.set('');
    this.applyFilters();
  }

  openDetail(id: number) {
    this.dialog.open(InventoryAdjustmentDetailDialog, id, '1100px');
  }
}
