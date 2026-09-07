import { inject, Injectable, signal } from "@angular/core";
import { UnitOfMeasureService } from "../../maintenance/services/unitOfMeasure/unit-of-measure-service";
import { ProductTypeService } from "../../maintenance/services/productType/product-type-service";
import { CatalogService } from "../../maintenance/services/catalog/catalog-service";
import { ProductModel } from "../model/productModel";

@Injectable() export class ProductFacade {

    private unitsService = inject(UnitOfMeasureService);
    private productTypeService = inject(ProductTypeService);
    private catalogService = inject(CatalogService);

    unitsOfMeasure = signal<any[]>([]);
    productTypes = signal<any[]>([]);
    catalogs = signal<any[]>([]);

    formSelections = {
        productType: signal<any | null>(null),
        catalog: signal<any | null>(null),
        unitOfMeasure: signal<any | null>(null),
    };

    filterSelections = {
        productType: signal<any | null>(null),
        catalog: signal<any | null>(null),
    };

    loadSelections() {
        this.loadCatalogs();
        this.loadUnits();
        this.loadProductTypes();
    }

    loadUnits(filter = '') {
        this.unitsService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.unitsOfMeasure.set(response.data);
            });
    }

    loadProductTypes(filter = '') {
        this.productTypeService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.productTypes.set(response.data);
            });
    }

    loadCatalogs(filter = '') {
        this.catalogService
            .getAll({ filter, page: 1, CantItems: 10 })
            .subscribe(response => {
                this.catalogs.set(response.data);
            });
    }

    setSelections(product: ProductModel) {

        this.formSelections.catalog.set(product.catalogoObj);
        this.formSelections.productType.set(product.tipoArticuloObj);
        this.formSelections.unitOfMeasure.set(product.unidadMedidaObj);

    }

    clearSelections() {

        this.formSelections.catalog.set(null);
        this.formSelections.productType.set(null);
        this.formSelections.unitOfMeasure.set(null);
        this.filterSelections.catalog.set(null);
        this.filterSelections.productType.set(null);

    }
}