import { computed, inject, Injectable, signal, WritableSignal } from "@angular/core";
import { PurchaseContractService } from "../../purchases-contracts/services/purchase-contract-service";
import { TableAction } from "../../../interfaces/table-content-interface";
import { purchaseContractModel } from "../../purchases-contracts/model/purchaseContractModel";
import { CONDITION } from "../../../shared/constant/select-options";
import { filterByProperty } from "../../../shared/helpers/filter.helper";
import { WarehouseNameService } from "../../maintenance/services/warehouseName/warehouse-name-service";
import { purchaseDetailContractModel } from "../../purchases-contracts/model/detail-contract-model";
import { FormGroup } from "@angular/forms";
import { StockEntryTypeService } from "../../maintenance/services/stockEntry/stock-entry-type-service";
import { DeliveryTypeService } from "../../maintenance/services/deliveryType/delivery-type-service";
import { StockEntryMapper } from "../mappers/stock-entry-mapper";
import { DialogService } from "../../../core/service/dialog-service/dialog";
import { PurchasesContractDetailDialog } from "../../purchases-contracts/dialog/purchases-contract-detail-dialog/purchases-contract-detail-dialog";
import { EntriesListDialog } from "../dialog/entries-list/entries-list";

@Injectable() export class EntriesManagementFacade {

    loading = signal(false);
    sectionOpen = signal(true);
    details = signal<any[]>([]);
    detailsPurchasesDetails = signal<any[]>([]);
    sectionOpenDetail = signal(false);
    sectionOpenGeneral = signal(false);
    purchaseContract = signal<any[]>([]);
    purchaseContractById = signal<purchaseContractModel | null>(null);
    selectedDetail = signal<purchaseDetailContractModel | null>(null);

    private purchaseContractService = inject(PurchaseContractService);
    private warehouseTypeService = inject(WarehouseNameService);
    private entryTypeService = inject(StockEntryTypeService);
    private deliveryTypeService = inject(DeliveryTypeService);
    private dialogService = inject(DialogService);

    condition = signal<any[]>(CONDITION);
    warehouseType = signal<any[]>([]);
    entryType = signal<any[]>([]);
    deliveryType = signal<any[]>([]);

    filteredcondition = signal(this.condition());

    formSelections = {
        condition: signal<any | null>(null),
        idTipoAlmcacen: signal<any | null>(null),
        idTipoEntrada: signal<any | null>(null),
        idTipoEntrega: signal<any | null>(null),
    }

    actionsDetails: TableAction[] = [
        {
            label: 'Dar entrada ',
            icon: 'bi bi-bag-plus',
            class: 'item-partialEntry',
            action: row => this.setDetailsToForm(row.row, row.index)
        },
    ];

    actions: TableAction[] = [
        {
            label: 'Crear entrada',
            icon: 'bi bi-box-seam',
            class: 'item-createEntry',
            action: row => this.loadPurchaseContractById(row.row.id)
        },
        {
            label: 'Ver listado de entradas',
            icon: 'bi bi-list-ul',
            class: 'item-verEntrier',
            action: row => this.openDialogEntryList(row.row.id)
        },
    ];

    openDialog(id: number) { this.dialogService.open(PurchasesContractDetailDialog, id) }
    openDialogDetails(id: number) { this.dialogService.open(PurchasesContractDetailDialog, id) }
    openDialogEntryList(id: number) { this.dialogService.open(EntriesListDialog, id) }

    addDetail(form: FormGroup) {

        const detail = form.getRawValue();

        // Cálculos
        const subtotal = detail.cantidad * detail.precio;
        const detailCalculated = {
            ...detail,
            subTotal: subtotal,
        };

        this.details.update(details => [...details, detailCalculated]);

        form.reset();
        this.clearDetailsSelections();
        // this.clearGeneralSelections();
    }

    totals = computed(() => {
        return this.details().reduce((acc, item) => {
            acc.total += item.subTotal;
            return acc;
        }, {
            total: 0,
        });
    });

    editDetail(product: any, form: FormGroup) {
        this.loadDetail(form, product.row);
        this.clearDetail(product.index, this.details);
    }

    private loadDetail(form: FormGroup, product: any) {
        form.reset(product);

        this.formSelections.condition.set(product.condicion);
        this.formSelections.idTipoAlmcacen.set(product.idTipoAlmcacen);

        form.markAsDirty();
    }

    setDetailsToForm(detail: purchaseDetailContractModel, index: number) {
        this.selectedDetail.set(detail);
        this.clearDetail(index, this.detailsPurchasesDetails);
    }

    clearDetail(index: number, target: WritableSignal<any[]>) {
        console.log(index);
        console.log(target());

        target.update(items =>
            items.filter((_, i) => i !== index)
        );
    }

    loadWarehouseType(filter: string = '') {
        this.warehouseTypeService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.warehouseType.set(response.data);
            });
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

    loadPurchaseContractById(id: number) {
        this.loading.set(true);
        this.purchaseContractService.getById(id)
            .subscribe({
                next: (data) => {
                    this.purchaseContractById.set(data.data);
                    this.detailsPurchasesDetails.set(data.data.detalles);

                    this.sectionOpenGeneral.set(true);
                    this.sectionOpenDetail.set(true);
                    this.loading.set(false);
                },
                error: () => { this.loading.set(false); }
            });
    }

    filterCondition(search: string) {
        this.filteredcondition.set(
            filterByProperty(this.condition(), search, 'name')
        );
    }

    loadPurchaseContract(filter: any) {
        this.purchaseContractService
            .getAll({ estado: 1, filter, page: 1, CantItems: 3 })
            .subscribe(response => { this.purchaseContract.set(response.data); });
    }

    loadData() {
        this.loadPurchaseContract('')
        this.loadWarehouseType()
        this.loadEntryTypes()
        this.loadDeliveryTypes()
    }

    clearDetailsSelections() {
        this.formSelections.condition.set(null);
        this.formSelections.idTipoAlmcacen.set(null);
    }

    clearGeneralSelections() {
        this.formSelections.idTipoEntrada.set(null);
        this.formSelections.idTipoEntrega.set(null);
    }

    clearPurchaseContract() {
        this.purchaseContractById.set(null);
        this.detailsPurchasesDetails.set([]);
    }

    clearDetails() {
        this.details.set([]);
    }

    buildCreateDto(form: FormGroup) {
        return StockEntryMapper.toCreateDto(
            form.getRawValue(),
            this.details()
        );
    }
}