import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, Subscription } from 'rxjs';
import { WarehouseNameService } from '../../maintenance/services/warehouseName/warehouse-name-service';
import { ProductService } from '../../products/services/product/product-service';
import { CampusDto, ProductOptionDto, WarehouseDto } from '../DTOs/inventory-adjustment-dto';
import { InventoryAdjustmentReferenceService } from '../services/inventory-adjustment-reference-service';
import { IntranetService } from '../../../shared/service/general.service';

@Injectable()
export class InventoryAdjustmentReferenceFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly referenceService = inject(InventoryAdjustmentReferenceService);
  private readonly warehouseService = inject(WarehouseNameService);
  private readonly productService = inject(ProductService);
  private intranetService = inject(IntranetService);
  private warehouseRequest?: Subscription;
  private productRequest?: Subscription;

  readonly campuses = signal<CampusDto[]>([]);
  readonly warehouses = signal<WarehouseDto[]>([]);
  readonly products = signal<ProductOptionDto[]>([]);
  readonly recintos = this.campuses;
  readonly error = signal('');
  private readonly errorEvents = new Subject<string>();
  readonly errors = this.errorEvents.asObservable();

  private reportError(message: string) {
    this.error.set(message);
    this.errorEvents.next(message);
  }

  formSelections = {
    idRecinto: signal<any | null>(null),
  }

  load() {
    this.loadRecintos()
    this.loadWarehouses();
    this.loadProducts();
  }

  loadRecintos() {
    this.intranetService
      .getAllRecinto()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (response.success === false) {
            this.reportError('No se pudieron cargar los recintos.');
            return;
          }
          this.campuses.set(response.data ?? []);
        },
        error: () => this.reportError('No se pudieron cargar los recintos.'),
      });
  }

  loadWarehouses(filter = '') {
    this.warehouseRequest?.unsubscribe();
    this.warehouseRequest = this.warehouseService
      .getAll({ filter, page: 1, CantItems: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success === false) { this.reportError('No se pudieron cargar los almacenes.'); return; }
          this.warehouses.set(response.data ?? []);
        },
        error: () => this.reportError('No se pudieron cargar los almacenes.'),
      });
  }

  loadProducts(filter = '') {
    this.productRequest?.unsubscribe();
    this.productRequest = this.productService
      .getAll({ filter, page: 1, CantItems: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success === false) { this.reportError('No se pudieron cargar los productos.'); return; }
          this.products.set(response.data ?? []);
        },
        error: () => this.reportError('No se pudieron cargar los productos.'),
      });
  }
}
