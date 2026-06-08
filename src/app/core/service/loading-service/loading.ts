import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Loading {

  private activeRequests = signal(0);
  loading = computed(() => this.visible());

  private visible = signal(false);
  private startTime = 0;

  start(): void {
    this.startTime = Date.now();
    this.activeRequests.update((n) => n + 1);
    this.visible.set(true);
  }

  stop(): void {
    this.activeRequests.update((n) => Math.max(n - 1, 0));

    if (this.activeRequests() === 0) {
      const elapsed = Date.now() - this.startTime;
      const minimumTime = 600;
      const remaining = minimumTime - elapsed;

      setTimeout(() => {
        this.visible.set(false);
      }, remaining > 0 ? remaining : 0);
    }
  }
}
