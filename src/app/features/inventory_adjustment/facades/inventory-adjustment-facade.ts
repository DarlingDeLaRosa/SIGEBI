import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { BaseCrud } from '../../../shared/abstracts/base-crud';
import { InventoryAdjustmentModel } from '../model/inventory-adjustment-model';
import {
  InventoryAdjustmentService,
  unwrapAdjustmentResponse,
} from '../services/inventory-adjustment-service';
import { InventoryAdjustmentFilterDto } from '../DTOs/inventory-adjustment-dto';
import { InventoryAdjustmentMapper } from '../mappers/inventory-adjustment-mapper';

@Injectable()
export class InventoryAdjustmentFacade extends BaseCrud<InventoryAdjustmentModel> {
  private readonly service = inject(InventoryAdjustmentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private request?: Subscription;
  readonly loading = signal(false);
  readonly removing = signal(false);
  readonly error = signal('');
  readonly totalItems = signal<number | null>(null);
  readonly filters = signal<InventoryAdjustmentFilterDto>({
    idRecinto: null,
    idTipoAlmacen: null,
    numeroTomaFisica: null,
    idProducto: null,
  });

  override getService() {
    return this.service;
  }

  // This endpoint uses an explicit POST filter form, not BaseCrud's GET text search.
  override filterResults() {}

  applyFilters(filters: InventoryAdjustmentFilterDto) {
    this.filters.set(filters);
    this.pagination.update((value) => ({ ...value, currentPage: 1 }));
    this.loadData();
  }

  override loadData() {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    const { currentPage, pageSize } = this.pagination();
    this.request = this.service
      .searchAdjustments(this.filters(), currentPage, pageSize)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.totalItems.set(response.totalItems ?? null);
          this.data.set({
            data: (response.data ?? []).map((item) => InventoryAdjustmentMapper.fromApi(item)),
            success: response.success,
            message: response.message,
            dateNow: '',
            currentPage: response.currentPage ?? currentPage,
            cantItem: response.cantItem ?? pageSize,
            cantPage: response.cantPage ?? 1,
          });
          this.pagination.set({
            currentPage: response.currentPage || currentPage,
            pageSize: response.cantItem || pageSize,
            totalPages: Math.max(1, response.cantPage ?? 1),
            totalItems: response.totalItems ?? 0,
          });
        },
        error: () =>
          this.error.set('No se pudieron cargar las conciliaciones. Intenta nuevamente.'),
      });
  }

  edit(id: number) {
    this.router.navigate(['/layout/conciliaciones/gestionar-ajuste-de-inventario', id]);
  }

  override remove(id: number) {
    if (this.removing()) return;
    this.alert.confirmDelete().then((result) => {
      if (!result.isConfirmed || this.destroyRef.destroyed) return;
      this.removing.set(true);
      this.service
        .delete(id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.removing.set(false)),
        )
        .subscribe({
          next: (response) => {
            try {
              unwrapAdjustmentResponse(response);
            } catch {
              this.error.set('No se pudo eliminar la conciliación.');
              return;
            }
            if (this.data()?.data.length === 1 && this.pagination().currentPage > 1) {
              this.pagination.update((value) => ({ ...value, currentPage: value.currentPage - 1 }));
            }
            this.loadData();
            this.alert.success('Conciliación eliminada');
          },
          error: () => this.error.set('No se pudo eliminar la conciliación.'),
        });
    });
  }
}
