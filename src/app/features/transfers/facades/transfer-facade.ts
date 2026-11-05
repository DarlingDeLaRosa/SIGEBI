import { Injectable, signal } from '@angular/core';
import { TransferFilters } from '../DTOs/transfer-filters';

@Injectable()
export class TransferFacade {
  readonly filtering = signal(false);
  readonly activeFilters = signal<TransferFilters>({ CreadoPor: null, Estado: null, Desde: null, Hasta: null });
  readonly loading = signal(false);
  readonly error = signal('');
  readonly hasKnownTotal = signal(true);

  toggleFilters() {
    this.filtering.update((value) => !value);
  }
}
