import { inject, Injectable, signal } from "@angular/core";
import { WarehouseNameService } from "../../maintenance/services/warehouseName/warehouse-name-service";
import { CONDITION } from "../../../shared/constant/select-options";
import { StockOutputService } from "../../maintenance/services/stockOutput/stock-output-service";
import { filterByProperty } from "../../../shared/helpers/filter.helper";
import { IntranetService } from "../../../shared/service/general.service";

@Injectable() export class OutputsManagementFacade {

    loading = signal(false);
    sectionOpen = signal(true);
    sectionOpenDetail = signal(false);
    sectionOpenGeneral = signal(false);
    details = signal<any[]>([]);

    private intranetService = inject(IntranetService);
    private warehouseTypeService = inject(WarehouseNameService);
    private outputTypeService = inject(StockOutputService);
    // private deliveryTypeService = inject(DeliveryTypeService);

    condition = signal<any[]>(CONDITION);
    outputTypes = signal<any[]>([]);
    recintos = signal<any[]>([]);
    departments = signal<any[]>([]);
    warehouseTypes = signal<any[]>([]);

    filteredCondition = signal(this.condition());

    formSelections = {
        condition: signal<any | null>(null),
        idRecinto: signal<any | null>(null),
        idDepar: signal<any | null>(null),
        idTipoAlmcacen: signal<any | null>(null),
        idTipoSalida: signal<any | null>(null),
    }

    // openDialog(id: number) { this.dialogService.open(PurchasesContractDetailDialog, id) }
    // openDialogDetails(id: number) { this.dialogService.open(PurchasesContractDetailDialog, id) }
    // openDialogEntryList(id: number) { this.dialogService.open(EntriesListDialog, id) }

    // addDetail(form: FormGroup) {

    //     const detail = form.getRawValue();

    //     // Cálculos
    //     const subtotal = detail.cantidad * detail.precio;
    //     const detailCalculated = {
    //         ...detail,
    //         subTotal: subtotal,
    //     };

    //     this.details.update(details => [...details, detailCalculated]);

    //     form.reset();
    //     this.clearDetailsSelections();
    //     // this.clearGeneralSelections();
    // }

    // totals = computed(() => {
    //     return this.details().reduce((acc, item) => {
    //         acc.total += item.subTotal;
    //         return acc;
    //     }, {
    //         total: 0,
    //     });
    // });

    // editDetail(product: any, form: FormGroup) {
    //     this.loadDetail(form, product.row);
    //     this.clearDetail(product.index, this.details);
    // }

    // private loadDetail(form: FormGroup, product: any) {
    //     form.reset(product);

    //     this.formSelections.condition.set(product.condicion);
    //     this.formSelections.idTipoAlmcacen.set(product.idTipoAlmcacen);

    //     form.markAsDirty();
    // }

    // setDetailsToForm(detail: purchaseDetailContractModel, index: number) {
    //     this.selectedDetail.set(detail);
    //     this.clearDetail(index, this.detailsPurchasesDetails);
    // }

    // clearDetail(index: number, target: WritableSignal<any[]>) {
    //     console.log(index);
    //     console.log(target());

    //     target.update(items =>
    //         items.filter((_, i) => i !== index)
    //     );
    // }

    loadWarehouseTypes(filter: string = '') {
        this.warehouseTypeService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.warehouseTypes.set(response.data);
            });
    }

    loadOutputTypes(filter: string = '') {
        this.outputTypeService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.outputTypes.set(response.data);
            });
    }

    loadRecintos() {
        this.intranetService
            .getAllRecinto()
            .subscribe(response => {
                this.recintos.set(response.data);
            });
    }

    loadDepartments() {
        this.intranetService
            .getAllAreas()
            .subscribe(response => {
                this.departments.set(response.data);
            });
    }

    // loadPurchaseContractById(id: number) {
    //     this.loading.set(true);
    //     this.purchaseContractService.getById(id)
    //         .subscribe({
    //             next: (data) => {
    //                 this.purchaseContractById.set(data.data);
    //                 this.detailsPurchasesDetails.set(data.data.detalles);

    //                 this.sectionOpenGeneral.set(true);
    //                 this.sectionOpenDetail.set(true);
    //                 this.loading.set(false);
    //             },
    //             error: () => { this.loading.set(false); }
    //         });
    // }

    filterCondition(search: string) {
        this.filteredCondition.set(
            filterByProperty(this.condition(), search, 'name')
        );
    }

    // loadPurchaseContract(filter: any) {
    //     this.purchaseContractService
    //         .getAll({ estado: 1, filter, page: 1, CantItems: 3 })
    //         .subscribe(response => { this.purchaseContract.set(response.data); });
    // }

    loadData() {
        this.loadWarehouseTypes()
        this.loadOutputTypes()
        this.loadRecintos()
        this.loadDepartments()
    }

    // clearDetailsSelections() {
    //     this.formSelections.condition.set(null);
    //     this.formSelections.idTipoAlmcacen.set(null);
    // }

    // clearGeneralSelections() {
    //     this.formSelections.idTipoEntrada.set(null);
    //     this.formSelections.idTipoEntrega.set(null);
    // }

    // clearPurchaseContract() {
    //     this.purchaseContractById.set(null);
    //     this.detailsPurchasesDetails.set([]);
    // }

    // clearDetails() {
    //     this.details.set([]);
    // }

    // buildCreateDto(form: FormGroup) {
    //     return StockEntryMapper.toCreateDto(
    //         form.getRawValue(),
    //         this.details()
    //     );
    // }
}