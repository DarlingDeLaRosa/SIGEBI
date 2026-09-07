import { computed, inject, Injectable, signal } from "@angular/core";
import { SuppliersService } from "../../maintenance/services/supplier/suppliers-service";
import { CURRENCY, PURCHASE_TYPE } from "../../../shared/constant/select-options";
import { filterByProperty } from "../../../shared/helpers/filter.helper";
import { UnitOfMeasureService } from "../../maintenance/services/unitOfMeasure/unit-of-measure-service";
import { ProductService } from "../../products/services/product/product-service";
import { FormGroup } from "@angular/forms";
import { PurchaseContractMapper } from "../mappers/purchase-contract-mapper";
import { CreatePurchaseContractDto } from "../DTOs/purchaseContractDTO";

@Injectable() export class PurchaseContractFormFacade {

    private productService = inject(ProductService);
    private unitsService = inject(UnitOfMeasureService);

    currencies = signal<any[]>(CURRENCY);
    product = signal<any[]>([]);
    unitsOfMeasure = signal<any[]>([]);
    details = signal<any[]>([]);

    filteredCurrencies = signal(this.currencies());

    formSelections = {
        idProducto: signal<any | null>(null),
        currency: signal<any | null>(null),
        idUnidadMe: signal<any | null>(null),
    }

    loadSelections() {
        this.loadUnits();
        this.loadProduct();
    }

    loadUnits(filter = '') {
        this.unitsService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.unitsOfMeasure.set(response.data);
            });
    }

    loadProduct(filter: string = '') {
        this.productService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.product.set(response.data);
            });
    }

    filterCurrencies(search: string) {
        this.filteredCurrencies.set(
            filterByProperty(this.currencies(), search, 'name')
        );
    }

    selectProduct(product: any, form: FormGroup) {
        form.patchValue({
            precioUnitario: product?.precio ?? 0,
            descripcion: product?.descripcion ?? '',
            itbismoneda: product?.itbis ?? 0,
            catalog: product?.catalogoObj.definicionProducto ?? 'No se encontro descripción del producto',
        })

        this.formSelections.idUnidadMe.set(product.unidadMedidaObj);
    }

    duplicate(form: FormGroup, product: any) {
        this.loadDetail(form, product);
    }

    editDetail(product: any, form: FormGroup) {
        this.loadDetail(form, product.row);
        this.clearDetail(product.index);
    }

    private loadDetail(form: FormGroup, product: any) {
        form.reset(product);

        this.formSelections.idUnidadMe.set(product.idUnidadMe);
        this.formSelections.idProducto.set(product.idProducto);

        form.markAsDirty();
    }

    addDetail(form: FormGroup) {

        const detail = form.getRawValue();
        
        // Cálculos
        const subtotal = detail.cantidad * detail.precioUnitario;
        const descuento = detail.descuento ?? 0;
        const itbis = subtotal * ((detail.itbismoneda ?? 0) / 100);
        const otrosImpuestos = detail.otrosImpuestosMoneda ?? 0;

        const detailCalculated = {
            ...detail,
            subtotal: subtotal - descuento,
            totalItbis: itbis,
            otrosImpuestosMoneda: otrosImpuestos,
            total: subtotal - descuento + itbis + otrosImpuestos
        };

        this.details.update(details => [...details, detailCalculated]);

        form.reset();
        this.clearDetailsSelections();
    }

    totals = computed(() => {
        return this.details().reduce((acc, item) => {

            acc.subtotal += item.subtotal;
            acc.itbis += item.totalItbis;
            acc.descuento += item.descuento ?? 0;
            acc.total += item.total;
            acc.totalOtrosImpuestos += item.otrosImpuestosMoneda ?? 0;

            return acc;

        }, {
            subtotal: 0,
            itbis: 0,
            descuento: 0,
            total: 0,
            totalOtrosImpuestos: 0
        });
    });

    clearDetail(index: number) {
        this.details.update(details =>
            details.filter((_, i) => i !== index)
        );
    }

    clearDetailsSelections() {
        this.formSelections.idProducto.set(null);
        this.formSelections.idUnidadMe.set(null);
    }

    clearSelections() {
        this.formSelections.currency.set(null);
    }

    clearDetails() {
        this.details.set([]);
    }

    buildCreateDto(form: FormGroup): CreatePurchaseContractDto {
        return PurchaseContractMapper.toCreateDto(
            form.getRawValue(),
            this.details(),
            this.totals()
        );
    }

    loadPurchaseContract(
        purchase: any,
        form: FormGroup
    ) {
        // Cabecera

        form.patchValue({

            id: purchase.id,

            noExpediente: purchase.noExpediente,

            noOrden: purchase.noOrden,

            descripcion: purchase.descripcion,

            modalidadCompra: purchase.modalidadCompra,

            idProveedor: purchase.idProveedor,

            anticipo: purchase.anticipo,

            formaPago: purchase.formaPago,

            plazoPago: purchase.plazoPago,

            moneda: purchase.moneda

        });

        // SearchSelect

        this.formSelections.currency.set({
            name: purchase.moneda,
            value: purchase.moneda
        });

        this.details.set(
            purchase.detalles.map((detail:any) =>
                PurchaseContractMapper.fromApiDetail(detail)
            )
        );
    }
}