import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { OutputService } from '../services/output-service';
import { OutputModel } from '../model/output-model';

@Injectable()
export class OutputDetailFacade {
  private service = inject(OutputService);
  private destroyRef = inject(DestroyRef);
  output = signal<OutputModel | null>(null);
  loading = signal(false);
  error = signal('');

  load(id: number) {
    if (this.loading()) return;
    this.output.set(null);
    this.error.set('');
    this.loading.set(true);
    this.service.getOutputDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: output => {
          this.output.set(output);
          if (!output) this.error.set('No se encontró el detalle de esta salida');
        },
        error: () => this.error.set('No se pudo cargar el detalle de la salida. Intenta nuevamente'),
      });
  }
}
