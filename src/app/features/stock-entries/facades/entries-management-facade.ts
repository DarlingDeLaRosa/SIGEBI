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
import { Alert } from "../../../core/service/alert-service/alert";

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
    private readonly activeLine = signal<number | null>(null);
    private readonly editingDetail = signal<any | null>(null);
    private originalDetails: any[] = [];
    readonly pendingQuantity = computed(() => this.remainingQuantity(this.activeLine(), this.editingDetail()));

    private purchaseContractService = inject(PurchaseContractService);
    private warehouseTypeService = inject(WarehouseNameService);
    private entryTypeService = inject(StockEntryTypeService);
    private deliveryTypeService = inject(DeliveryTypeService);
    private dialogService = inject(DialogService);
    private alert = inject(Alert);

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
        if (!this.validateOrderLine(detail.idDetalleOrden)) return;
        if (!this.validateQuantity(detail.cantidad, this.remainingQuantity(detail.idDetalleOrden, this.editingDetail()), detail.serial)) return;
        if (form.invalid) return;

        // Cálculos
        const subtotal = detail.cantidad * detail.precio;
        const detailCalculated = {
            ...detail,
            subTotal: subtotal,
        };

        const editing = this.editingDetail();
        this.details.update(details => editing
            ? details.map(row => row === editing ? detailCalculated : row)
            : [...details, detailCalculated]);

        form.reset();
        this.clearDetailsSelections();
        this.selectedDetail.set(null);
        this.activeLine.set(null);
        this.editingDetail.set(null);
    }

    private remainingQuantity(lineId: number | null, excluded?: any): number | null {
        if (!Number.isInteger(lineId) || !lineId || lineId < 0) return null;
        const lines = this.purchaseContractById()?.detalles?.filter(line => line.idOrdenCompra === lineId);
        if (lines?.length !== 1) return null;
        const saldo = lines[0].calCantidad;
        if (!Number.isInteger(saldo) || saldo < 0) return null;

        const quantity = (rows: any[]) => rows.reduce((total, row) =>
            row.idDetalleOrden === lineId ? total + Number(row.cantidad) : total, 0);
        const limit = saldo + quantity(this.originalDetails) - quantity(this.details().filter(row => row !== excluded));
        return Number.isInteger(limit) ? Math.max(0, limit) : null;
    }

    private validateOrderLine(lineId: number): boolean {
        if (this.loading()) {
            this.alert.error('Espera a que se cargue el saldo de la orden de compra.');
            return false;
        }
        const order = this.purchaseContractById();
        if (order && order.detalles?.filter(line => line.idOrdenCompra === lineId).length !== 1) {
            this.alert.error('No se pudo identificar una única línea de la orden de compra para este detalle.');
            return false;
        }
        return true;
    }

    private validateQuantity(value: unknown, limit: number | null, serial?: string | null): boolean {
        const quantity = Number(value);
        if (limit === null) {
            this.alert.error('No se pudo confirmar la cantidad pendiente de recibir.');
        } else if (limit === 0) {
            this.alert.error('Esta línea no tiene cantidad pendiente de recibir.');
        } else if (!Number.isInteger(quantity) || quantity <= 0) {
            this.alert.error('La cantidad debe ser un número entero mayor que cero.');
        } else if (serial?.trim() && quantity > 1) {
            this.alert.error('La cantidad no puede ser mayor que 1 cuando se indica un número de serie.');
        } else if (quantity > limit) {
            this.alert.error(`La cantidad no puede ser mayor que la pendiente de recibir (${limit}).`);
        } else {
            return true;
        }
        return false;
    }

    validateDetails(): boolean {
        if (this.activeLine() !== null || this.editingDetail()) {
            this.alert.error('Agrega el detalle en edición antes de guardar la entrada.');
            return false;
        }
        return this.details().every(row =>
            this.validateOrderLine(row.idDetalleOrden) &&
            this.validateQuantity(row.cantidad, this.remainingQuantity(row.idDetalleOrden, row), row.serial));
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
        if (this.loading()) {
            this.alert.error('Espera a que se cargue el saldo de la orden de compra.');
            return;
        }
        if (this.activeLine() !== null || this.editingDetail()) {
            this.alert.error('Agrega o limpia el detalle actual antes de editar otro.');
            return;
        }
        this.sectionOpenDetail.set(true)
        this.selectedDetail.set(null);
        this.activeLine.set(product.row.idDetalleOrden);
        this.editingDetail.set(product.row);
        this.loadDetail(form, product.row);
    }

    private loadDetail(form: FormGroup, product: any) {
        form.reset(product);

        this.formSelections.condition.set(product.condicion);
        this.formSelections.idTipoAlmcacen.set(product.idTipoAlmcacen);

        form.markAsDirty();
    }

    setDetailsToForm(detail: purchaseDetailContractModel, index: number) {
        if (this.activeLine() !== null || this.editingDetail()) {
            this.alert.error('Agrega o limpia el detalle actual antes de seleccionar otro.');
            return;
        }
        const limit = this.remainingQuantity(detail.idOrdenCompra);
        if (limit === null || limit === 0) {
            this.validateQuantity(1, limit);
            return;
        }
        this.editingDetail.set(null);
        this.activeLine.set(detail.idOrdenCompra);
        this.selectedDetail.set(detail);
        this.clearDetail(index, this.detailsPurchasesDetails);
    }

    clearDetailForm(form: FormGroup): void {
        const selected = this.selectedDetail();
        if (selected) this.detailsPurchasesDetails.update(rows => [...rows, selected]);
        this.selectedDetail.set(null);
        this.activeLine.set(null);
        this.editingDetail.set(null);
        this.clearDetailsSelections();
        form.reset();
    }

    clearDetail(index: number, target: WritableSignal<any[]>) {
        if (target === this.details && target()[index] === this.editingDetail()) {
            this.alert.error('Limpia el detalle en edición antes de eliminarlo.');
            return;
        }

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
        if (this.loading()) return;
        if (this.purchaseContractById() && (this.details().length || this.activeLine() !== null)) {
            this.alert.error('Limpia los detalles antes de cambiar de orden de compra.');
            return;
        }
        this.loading.set(true);
        this.purchaseContractService.getById(id)
            .subscribe({
                next: (data) => {
                    if (!data.data || data.success === false) {
                        this.loading.set(false);
                        this.alert.error('No se pudo consultar el saldo de la orden de compra.');
                        return;
                    }
                    const lines = data.data.detalles ?? [];
                    if (this.originalDetails.length) {
                        const resolvedDetails = new Map(this.originalDetails.map(detail => {
                            const lineId = Number(detail.idDetalleOrden);
                            if (Number.isInteger(lineId) && lineId > 0) {
                                return [detail, { ...detail, idDetalleOrden: lineId }];
                            }
                            const matches = lines.filter((line: purchaseDetailContractModel) =>
                                line.idProducto === detail.idProducto);
                            const resolved = matches.length === 1
                                ? { ...detail, idDetalleOrden: matches[0].idOrdenCompra }
                                : detail;
                            return [detail, resolved];
                        }));
                        this.originalDetails = [...resolvedDetails.values()];
                        this.details.update(rows => rows.map(row => resolvedDetails.get(row) ?? row));
                    }
                    this.purchaseContractById.set(data.data);
                    this.detailsPurchasesDetails.set(lines);

                    this.sectionOpenGeneral.set(true);
                    this.sectionOpenDetail.set(true);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                    this.alert.error('No se pudo consultar el saldo de la orden de compra.');
                }
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
        this.selectedDetail.set(null);
        this.activeLine.set(null);
        this.editingDetail.set(null);
        this.originalDetails = [];
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

    loadStockEntryHead(entry: any, form: FormGroup) {
        form.patchValue({
            id: entry.data.idEntrada,
            idOrdenCompra: entry.data.idOrdenCompra,
            idProveedor: entry.data.proveedor?.idProveedor,
            idTipoEntrada: entry.data.tipoEntrada?.idTipoEntrada,
            idTipoEntrega: entry.data.tipoEntrega?.idTipoEntrega,
            fechaFactura: entry.data.fechaFactura?.slice(0, 10),
            itbisGeneral: entry.data.itbisGeneral,
            total: entry.data.total,
            observacion: entry.data.observacion,
            itbisGeneralEstado: entry.data.itbisGeneralEstado,
            noConduce: entry.data.noConduce,
            noFactura: entry.data.noFactura,
        });

        this.originalDetails = (entry.data.detalles ?? []).map((detail: any) => StockEntryMapper.fromApiDetail(detail));
        this.details.set([...this.originalDetails]);
        if (entry.data.idOrdenCompra > 0) {
            this.loadPurchaseContractById(entry.data.idOrdenCompra);
        }

    }
}
