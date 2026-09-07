import { inject, Injectable, signal } from '@angular/core';
import { StockEntryService } from '../services/stock-entry-service';


@Injectable()
export class EntryDetailFacade {

    private service = inject(StockEntryService);
    entry = signal<any>(null);
    loading = signal(false);

    load(id: number): void {

        this.loading.set(true);
        this.service.getById(id)
            .subscribe({

                next: (response) => {
                    console.log(response);
                    
                    this.entry.set(response.data);
                    this.loading.set(false);
                },

                error: () => {
                    this.loading.set(false);
                }
            });
    }
}