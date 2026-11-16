import { inject, Injectable, signal } from "@angular/core";
import { StockEntryService } from "../services/stock-entry-service";

@Injectable()
export class EntryListFacade {

    private service = inject(StockEntryService);
    stockEntry = signal<any>(null);
    loading = signal(false);
    loadFailed = signal(false);

    load(id: number) {
        this.loading.set(true);
        this.loadFailed.set(false);
        this.service.getEntryByIdOrden(id)
            .subscribe({
                next: (data) => {
                    this.loadFailed.set(data.success === false);
                    this.stockEntry.set(data.data);
                    this.loading.set(false);
                },
                error: () => {
                    this.loadFailed.set(true);
                    this.loading.set(false);
                }
            });
    }
}
