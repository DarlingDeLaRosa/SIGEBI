import { inject, Injectable, signal } from "@angular/core";
import { StockEntryService } from "../services/stock-entry-service";

@Injectable()
export class EntryListFacade {

    private service = inject(StockEntryService);
    stockEntry = signal<any>(null);
    loading = signal(false);

    load(id: number) {
        this.loading.set(true);
        this.service.getEntryByIdOrden(id)
            .subscribe({
                next: (data) => {
                    this.stockEntry.set(data.data);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
    }
}