import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UnitOfMeasureService } from "../../maintenance/services/unitOfMeasure/unit-of-measure-service";
import { ProductTypeService } from "../../maintenance/services/productType/product-type-service";
import { CatalogService } from "../../maintenance/services/catalog/catalog-service";
import { ProductModel } from "../model/productModel";
import { IntranetService } from '../../../shared/service/general.service';
import { Alert } from '../../../core/service/alert-service/alert';

export interface ProductCampus { idRecinto: number; nombre: string; }

@Injectable() export class ProductFacade {

    private unitsService = inject(UnitOfMeasureService);
    private productTypeService = inject(ProductTypeService);
    private catalogService = inject(CatalogService);
    private intranetService = inject(IntranetService);
    private destroyRef = inject(DestroyRef);
    private alert = inject(Alert);

    unitsOfMeasure = signal<any[]>([]);
    productTypes = signal<any[]>([]);
    catalogs = signal<any[]>([]);
    campuses = signal<ProductCampus[]>([]);
    campusSearch = signal('');
    filteredCampuses = computed(() => this.campuses().filter(campus =>
        campus.nombre.toLowerCase().includes(this.campusSearch().trim().toLowerCase())));

    formSelections = {
        productType: signal<any | null>(null),
        catalog: signal<any | null>(null),
        unitOfMeasure: signal<any | null>(null),
    };

    filterSelections = {
        campus: signal<ProductCampus | null>(null),
        productType: signal<any | null>(null),
        catalog: signal<any | null>(null),
    };

    loadSelections() {
        this.loadCampuses();
        this.loadCatalogs();
        this.loadUnits();
        this.loadProductTypes();
    }

    loadCampuses() {
        this.intranetService.getAllRecinto().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: response => {
                if (response.success === false) { this.alert.error('No se pudieron cargar los recintos'); return; }
                this.campuses.set(response.data ?? []);
            },
            error: () => this.alert.error('No se pudieron cargar los recintos'),
        });
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
        this.filterSelections.campus.set(null);
        this.campusSearch.set('');

    }
}
