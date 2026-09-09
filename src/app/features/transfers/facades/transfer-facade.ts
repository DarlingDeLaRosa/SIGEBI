import { Injectable, signal } from '@angular/core';

@Injectable()
export class TransferFacade {
  readonly filtering = signal(false);
  readonly activeFilter = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly hasKnownTotal = signal(true);

  toggleFilters() {
    this.filtering.update((value) => !value);
  }
}
