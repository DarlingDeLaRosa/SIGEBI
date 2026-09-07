import { inject, Injectable, signal } from "@angular/core";
import { PurchaseContractService } from "../services/purchase-contract-service";

@Injectable()
export class PurchaseContractDetailFacade {

    private service = inject(PurchaseContractService);
    purchaseContract = signal<any>(null);
    loading = signal(false);

    load(id: number) {
        this.loading.set(true);
        this.service.getById(id)
            .subscribe({
                next: (data) => {
                    this.purchaseContract.set(data.data);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
    }
}