import { inject, Injectable, signal } from "@angular/core";
import { StockEntryService } from "../services/stock-entry-service";
import { DeliveryTypeService } from "../../maintenance/services/deliveryType/delivery-type-service";
import { SuppliersService } from "../../maintenance/services/supplier/suppliers-service";
import { IntranetService } from "../../../shared/service/general.service";
import { StockEntryTypeService } from "../../maintenance/services/stockEntry/stock-entry-type-service";
import { Router } from "@angular/router";
import { StockEntryModel } from "../model/entry-model";
import { BasicActionRules } from "../../../interfaces/table-content-interface";

@Injectable() export class EntriesFacade {

    // private purchaseContractService = inject(PurchaseContractService);
    // private warehouseTypeService = inject(WarehouseNameService);
    router = inject(Router);
    private intranetService = inject(IntranetService);
    private supplierService = inject(SuppliersService);
    private entryTypeService = inject(StockEntryTypeService);
    private deliveryTypeService = inject(DeliveryTypeService);

    private readonly creationMonthRule = {
        disabled: (entry: StockEntryModel) => !this.canModifyEntry(entry),
        disabledReason: () => 'Solo puedes editar o eliminar entradas del mes actual, salvo que estén habilitadas para edición.',
    };

    readonly basicActionRules: BasicActionRules = {
        edit: this.creationMonthRule,
        remove: this.creationMonthRule,
    };

    canModifyEntry(entry: StockEntryModel): boolean {
        if (entry.isEditable === true) return true;

        const createdAt = entry.fechaCreacion;
        if (!createdAt || !Number.isFinite(Date.parse(createdAt))) return false;

        const now = new Date();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        return createdAt.slice(0, 7) === `${now.getFullYear()}-${currentMonth}`;
    }

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

    clearFilterSelections(): void {
        this.formSelections.idTipoEntrada.set(null);
        this.formSelections.idTipoEntrega.set(null);
        this.formSelections.idProveedor.set(null);
        this.formSelections.idRecinto.set(null);
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

    editEntries(idEntrada: number) {
        this.router.navigate(
            ['/layout/entradas/gestionar-Entradas'],
            { state: { idEntrada: idEntrada } }
        );
    }

    loadData() {
        this.loadEntryTypes()
        this.loadDeliveryTypes()
        this.loadSupplier()
        this.loadRecintos()
    }
}
