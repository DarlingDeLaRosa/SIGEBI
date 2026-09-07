import { inject, Injectable, signal } from "@angular/core";
import { SuppliersService } from "../../maintenance/services/supplier/suppliers-service";
import { PAYMENT_METHOD, PURCHASE_STATUS, PURCHASE_TYPE } from "../../../shared/constant/select-options";
import { filterByProperty } from "../../../shared/helpers/filter.helper";

@Injectable() export class PurchaseContractReferenceFacade {

    private supplierService = inject(SuppliersService);
    paymentMethods = signal<any[]>(PAYMENT_METHOD);
    purchasesTypes = signal<any[]>(PURCHASE_TYPE);

    suppliers = signal<any[]>([]);
    filteredPaymentMethods = signal(this.paymentMethods());
    filteredPurchasesTypes = signal(this.purchasesTypes());

    filterSelections = {
        purchasesType: signal<any | null>(null),
        idProveedor: signal<any | null>(null),
        paymentMethod: signal<any | null>(null),
        status: signal<any | null>(null),
    };

    loadSelections() { this.loadSupplier(); }

    loadSupplier(filter = '', idProveedor : number = 0) {
        this.supplierService
            .getAll({ filter, idProveedor, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.suppliers.set(response.data);
            });
    }

    clearSelections() {
        this.filterSelections.purchasesType.set(null);
        this.filterSelections.status.set(null);
        this.filterSelections.idProveedor.set(null);
        this.filterSelections.paymentMethod.set(null);
    }

    filterPurchasesTypes(search: string) {
        this.filteredPurchasesTypes.set(
            filterByProperty(this.purchasesTypes(), search, 'name')
        );
    }
    
    filterPaymentMethods(search: string) {
        this.filteredPaymentMethods.set(
            filterByProperty( this.paymentMethods(), search, 'name')
        );
    }
} 7