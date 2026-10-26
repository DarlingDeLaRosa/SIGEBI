import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { RequestsService } from '../services/requests-service';
import { RequestModel } from '../model/request-model';

@Injectable()
export class RequestDetailFacade {
  private service = inject(RequestsService);
  private destroyRef = inject(DestroyRef);
  request = signal<RequestModel | null>(null);
  loading = signal(false);
  error = signal('');

  load(id: number) {
    if (this.loading()) return;
    this.request.set(null);
    this.error.set('');
    this.loading.set(true);
    this.service.getRequestDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: request => {
          this.request.set(request);
          if (!request) this.error.set('No se encontró la solicitud');
        },
        error: () => this.error.set('No se pudo cargar el detalle de la solicitud. Intenta nuevamente'),
      });
  }
}
