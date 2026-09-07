import { inject, Injectable, signal } from "@angular/core";
import { StockEntryService } from "../services/stock-entry-service";
import { DeliveryTypeService } from "../../maintenance/services/deliveryType/delivery-type-service";
import { SuppliersService } from "../../maintenance/services/supplier/suppliers-service";
import { IntranetService } from "../../../shared/service/general.service";

@Injectable() export class EntriesFacade {

    // private purchaseContractService = inject(PurchaseContractService);
    // private warehouseTypeService = inject(WarehouseNameService);
    private intranetService = inject(IntranetService);
    private supplierService = inject(SuppliersService);
    private entryTypeService = inject(StockEntryService);
    private deliveryTypeService = inject(DeliveryTypeService);

    entryType = signal<any[]>([]);
    suppliers = signal<any[]>([]);
    deliveryType = signal<any[]>([]);
    recintos = signal<any[]>([]);

    // condition = signal<any[]>(CONDITION);
    // warehouseType = signal<any[]>([]);

    // filteredcondition = signal(this.condition());

    formSelections = {
        idTipoEntrada: signal<any | null>(null),
        idTipoEntrega: signal<any | null>(null),
        idProveedor: signal<any | null>(null),
        idRecinto: signal<any | null>(null),


        condition: signal<any | null>(null),
        idTipoAlmcacen: signal<any | null>(null),
    }

    loadEntryTypes(filter: string = '') {
        this.entryTypeService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.entryType.set(response.data);
            });
    }

    loadDeliveryTypes(filter: string = '') {
        this.deliveryTypeService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.deliveryType.set(response.data);
            });
    }

    loadSupplier(filter = '', idProveedor: number = 0) {
        this.supplierService
            .getAll({ filter, idProveedor, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.suppliers.set(response.data);
            });
    }

    loadRecintos() {
        this.intranetService
            .getAllRecinto()
            .subscribe(response => {
                this.recintos.set(response.data);
            });
    }

    loadData() {
        this.loadEntryTypes()
        this.loadDeliveryTypes()
        this.loadSupplier()
        this.loadRecintos()
    }

}