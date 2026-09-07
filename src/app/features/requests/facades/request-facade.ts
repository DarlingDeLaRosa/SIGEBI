import { inject, Injectable, signal } from "@angular/core";
import { PURCHASE_STATUS } from "../../../shared/constant/select-options";
import { filterByProperty } from "../../../shared/helpers/filter.helper";
import { Router } from "@angular/router";
import { TableAction } from "../../../interfaces/table-content-interface";
import { DialogService } from "../../../core/service/dialog-service/dialog";
import { EntriesListDialog } from "../../stock-entries/dialog/entries-list/entries-list";

@Injectable() export class RequestFacade {

    router = inject(Router);
    status = signal<any[]>(PURCHASE_STATUS);
    filteredStatus = signal(this.status());
    filterSelections = { status: signal<any | null>(null) };

    private dialogService = inject(DialogService);

    actions: TableAction[] = [
        {
            label: 'Ejemplo',
            icon: 'bi bi-box-seam',
            class: 'item-createEntry',
            action: row => this.clearSelections()
        }
    ];

    // openDialogEntryList(id: number) { this.dialogService.open(EntriesListDialog, id) }

    filterStatus(search: string) {
        this.filteredStatus.set(
            filterByProperty(this.status(), search, 'name')
        );
    }

    // editPurchaseContract(id: number) {
    //     this.router.navigate(
    //         ['/layout/orden-de-compra/gestionar-ordenes-de-compra'],
    //         { state: { purchaseContract: id } }
    //     );
    // }

    // createStockEntry(row: any) {

    // }

    clearSelections() {
        this.filterSelections.status.set(null);
    }
}