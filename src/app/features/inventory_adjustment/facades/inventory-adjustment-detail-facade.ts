import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { InventoryAdjustmentService } from '../services/inventory-adjustment-service';
import { InventoryAdjustmentMapper } from '../mappers/inventory-adjustment-mapper';
import { InventoryAdjustmentModel } from '../model/inventory-adjustment-model';

@Injectable()
export class InventoryAdjustmentDetailFacade {
  private readonly service = inject(InventoryAdjustmentService);
  private readonly destroyRef = inject(DestroyRef);
  readonly adjustment = signal<InventoryAdjustmentModel | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  load(id: number) {
    this.loading.set(true);
    this.error.set('');
    this.service
      .getAdjustment(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => this.adjustment.set(InventoryAdjustmentMapper.fromApi(response)),
        error: () => this.error.set('No se pudo cargar el detalle de la conciliación.'),
      });
  }
}
