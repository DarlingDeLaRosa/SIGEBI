import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { WarehouseNameService } from '../../maintenance/services/warehouseName/warehouse-name-service';
import { ProductService } from '../../products/services/product/product-service';
import { CampusDto, ProductOptionDto, WarehouseDto } from '../DTOs/inventory-adjustment-dto';
import { InventoryAdjustmentReferenceService } from '../services/inventory-adjustment-reference-service';

@Injectable()
export class InventoryAdjustmentReferenceFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly referenceService = inject(InventoryAdjustmentReferenceService);
  private readonly warehouseService = inject(WarehouseNameService);
  private readonly productService = inject(ProductService);
  private warehouseRequest?: Subscription;
  private productRequest?: Subscription;

  readonly campuses = signal<CampusDto[]>([]);
  readonly warehouses = signal<WarehouseDto[]>([]);
  readonly products = signal<ProductOptionDto[]>([]);
  readonly error = signal('');

  load() {
    this.referenceService
      .getCampuses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campuses) => this.campuses.set(campuses),
        error: () => this.error.set('No se pudieron cargar los recintos.'),
      });
    this.loadWarehouses();
    this.loadProducts();
  }

  loadWarehouses(filter = '') {
    this.warehouseRequest?.unsubscribe();
    this.warehouseRequest = this.warehouseService
      .getAll({ filter, page: 1, CantItems: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.warehouses.set(response.data),
        error: () => this.error.set('No se pudieron cargar los almacenes.'),
      });
  }

  loadProducts(filter = '') {
    this.productRequest?.unsubscribe();
    this.productRequest = this.productService
      .getAll({ filter, page: 1, CantItems: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.products.set(response.data),
        error: () => this.error.set('No se pudieron cargar los productos.'),
      });
  }
}
