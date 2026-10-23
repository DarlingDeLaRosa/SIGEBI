import { computed, DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Subscription } from 'rxjs';
import { RequestMapper } from '../mapper/request-mapper';
import { RequestsService } from '../services/requests-service';
import { RequestDetailFormValue, RequestFormValue } from '../DTOs/request-form-values';
import { ProductService } from '../../products/services/product/product-service';
import { ProductTypeService } from '../../maintenance/services/productType/product-type-service';
import { IntranetService } from '../../../shared/service/general.service';
import { Alert } from '../../../core/service/alert-service/alert';

@Injectable()
export class RequestFormFacade {
  private requestService = inject(RequestsService);
  private productService = inject(ProductService);
  private productTypeService = inject(ProductTypeService);
  private intranetService = inject(IntranetService);
  private alert = inject(Alert);
  private destroyRef = inject(DestroyRef);
  private productRequest?: Subscription;
  private personRequest?: Subscription;
  private articleRequest?: Subscription;
  private detailRequest?: Subscription;

  sectionOpenGeneral = signal(true);
  sectionOpenDetail = signal(true);
  details = signal<RequestDetailFormValue[]>([]);
  editingIndex = signal<number | null>(null);
  formSelections = {
    idRecinto: signal<any | null>(null),
    idTipoArticulo: signal<any | null>(null),
    idTipoSolicitud: signal<any | null>(null),
    idProducto: signal<any | null>(null),
    solicitante: signal<any | null>(null),
  };
  recinto = signal<any[]>([]);
  tipoArticulo = signal<any[]>([]);
  tipoSolicitud = signal<any[]>([]);
  products = signal<any[]>([]);
  people = signal<any[]>([]);
  recintoSearch = signal('');
  requestTypeSearch = signal('');
  filteredRecintos = computed(() => this.recinto().filter(item =>
    item.nombre.toLowerCase().includes(this.recintoSearch().toLowerCase())));
  filteredRequestTypes = computed(() => this.tipoSolicitud().filter(item =>
    item.nombre.toLowerCase().includes(this.requestTypeSearch().toLowerCase())));
  loading = signal(false);
  loadingProducts = signal(false);
  checkingProduct = signal(false);
  totalDetails = computed(() => this.details().reduce((total, item) => total + item.cantidadSolicitada, 0));

  loadSelections() {
    this.loadRecintos();
    this.requestService.getRequestTypes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (!res.success) { this.alert.error('No se pudieron cargar los tipos de solicitud'); return; }
        this.tipoSolicitud.set(res.data ?? []);
      },
      error: () => this.alert.error('No se pudieron cargar los tipos de solicitud'),
    });
    this.loadArticleTypes();
    this.loadProducts();
  }

  loadRecintos() {
    this.intranetService.getAllRecinto().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => this.recinto.set(res.data ?? []),
      error: (error: HttpErrorResponse) => {
        const message = error.status === 0
          ? 'No se pudo conectar con la intranet para cargar los recintos. Comprueba el acceso a la red institucional'
          : error.status === 401 || error.status === 403
            ? 'La intranet rechazó la autorización para consultar los recintos'
            : 'No se pudieron cargar los recintos. Intenta nuevamente';
        this.alert.error(message);
      },
    });
  }

  loadArticleTypes(filter = '') {
    this.articleRequest?.unsubscribe();
    this.articleRequest = this.productTypeService.getAll({ filter, page: 1, CantItems: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: res => this.tipoArticulo.set(res.data ?? []),
        error: () => { this.tipoArticulo.set([]); this.alert.error('No se pudieron cargar los tipos de artículo'); },
      });
  }

  loadProducts(filter = '') {
    this.productRequest?.unsubscribe();
    this.loadingProducts.set(true);
    this.productRequest = this.productService.getAll({ filter, page: 1, CantItems: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingProducts.set(false)))
      .subscribe({
        next: res => this.products.set(res.data ?? []),
        error: () => { this.products.set([]); this.alert.error('No se pudieron cargar los productos'); },
      });
  }

  productSearchChanged(form: FormGroup) {
    this.productRequest?.unsubscribe();
    this.detailRequest?.unsubscribe();
    this.products.set([]);
    this.clearDetailSelection();
    form.patchValue({ idProducto: 0, nombreProducto: '' });
    form.markAsDirty();
  }

  personSearchChanged(form: FormGroup) {
    this.personRequest?.unsubscribe();
    this.people.set([]);
    this.formSelections.solicitante.set(null);
    form.patchValue({ solicitante: '', cargoSolicitante: '', unidadOrganizativa: '' });
  }

  loadPeople(filter: string) {
    this.personRequest?.unsubscribe();
    if (!filter.trim()) { this.people.set([]); return; }
    this.personRequest = this.intranetService.filterPeople(filter.trim())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: res => {
          if (!res.status) { this.people.set([]); this.alert.error('No se pudieron buscar los solicitantes'); return; }
          this.people.set((res.data ?? []).map(person => ({
            ...person, nombreCompleto: [person.nombre, person.apellidos].filter(Boolean).join(' ').trim(),
          })));
        },
        error: () => { this.people.set([]); this.alert.error('No se pudieron buscar los solicitantes'); },
      });
  }

  selectPerson(person: any, form: FormGroup) {
    if (!person?.nombreCompleto || !person.cargo?.nombre?.trim() || !person.unidadOrganizativa?.trim()) {
      this.personSearchChanged(form);
      this.alert.error('El solicitante no tiene cargo o unidad organizativa. Selecciona otra persona');
      return;
    }
    this.formSelections.solicitante.set(person);
    form.patchValue({ solicitante: person.nombreCompleto, cargoSolicitante: person.cargo.nombre,
      unidadOrganizativa: person.unidadOrganizativa });
    form.markAsDirty();
  }

  private hasStock(product: any) {
    if (typeof product?.stock !== 'number' || !Number.isFinite(product.stock)) {
      this.alert.error('No se pudo comprobar la existencia del producto');
      return false;
    }
    if (product.stock <= 0) {
      this.alert.error('Este producto no puede ser seleccionado porque no hay existencia del mismo');
      return false;
    }
    return true;
  }

  selectProduct(product: any, form: FormGroup) {
    this.detailRequest?.unsubscribe();
    this.clearDetailSelection();
    form.patchValue({ idProducto: 0, nombreProducto: '' });
    if (!product || !this.hasStock(product)) return;
    this.formSelections.idProducto.set(product);
    form.patchValue({ idProducto: product.idProducto, nombreProducto: product.nombre });
    form.markAsDirty();
  }

  addDetail(form: FormGroup) {
    if (this.loading() || this.checkingProduct() || this.loadingProducts()) return;
    const detail = form.getRawValue() as RequestDetailFormValue;
    if (!this.formSelections.idProducto() || detail.idProducto <= 0) {
      this.alert.error('Selecciona un producto'); return;
    }
    if (detail.cantidadSolicitada === 0) {
      this.alert.error('La cantidad no puede ser 0'); return;
    }
    if (typeof detail.cantidadSolicitada !== 'number' || !Number.isFinite(detail.cantidadSolicitada) || detail.cantidadSolicitada <= 0) {
      this.alert.error('Ingresa una cantidad mayor que 0'); return;
    }
    if (form.invalid || !this.hasStock(this.formSelections.idProducto())) { form.markAllAsTouched(); return; }
    const index = this.editingIndex();
    if (this.details().some((item, position) => position !== index && item.idProducto === detail.idProducto)) {
      this.alert.error('Este producto ya está en el listado. Edita la fila existente'); return;
    }
    this.details.update(items => index === null ? [...items, detail]
      : items.map((item, position) => position === index ? detail : item));
    this.clearDetailForm(form);
  }

  editDetail(event: { row: RequestDetailFormValue; index: number }, form: FormGroup) {
    if (this.loading()) return;
    this.detailRequest?.unsubscribe();
    this.clearDetailForm(form);
    this.checkingProduct.set(true);
    this.detailRequest = this.productService.getById(event.row.idProducto)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.checkingProduct.set(false)))
      .subscribe({
        next: res => {
          const product = res.data;
          if (!this.hasStock(product)) return;
          this.editingIndex.set(event.index);
          this.selectProduct(product, form);
          form.patchValue({ cantidadSolicitada: event.row.cantidadSolicitada });
        },
        error: () => this.alert.error('No se pudo comprobar la existencia del producto'),
      });
  }

  clearDetail(index: number, target: WritableSignal<any[]>) {
    if (this.loading() || this.checkingProduct()) return;
    target.update(items => items.filter((_, position) => position !== index));
    const editing = this.editingIndex();
    if (editing === index) { this.editingIndex.set(null); this.clearDetailSelection(); }
    else if (editing !== null && editing > index) this.editingIndex.set(editing - 1);
  }

  clearDetailSelection() { this.formSelections.idProducto.set(null); }

  clearDetailForm(form: FormGroup) {
    this.detailRequest?.unsubscribe();
    this.editingIndex.set(null);
    this.clearDetailSelection();
    form.reset({ idProducto: 0, nombreProducto: '', cantidadSolicitada: 0 });
  }

  clearDetails() { this.details.set([]); this.editingIndex.set(null); }

  clearSelections() {
    Object.values(this.formSelections).forEach(selection => selection.set(null));
    this.people.set([]);
  }

  buildCreateDto(form: FormGroup) {
    return RequestMapper.toCreateDto(form.getRawValue() as RequestFormValue, this.details());
  }

  create(form: FormGroup, onSuccess?: () => void, detailForm?: FormGroup) {
    if (this.loading() || this.checkingProduct()) return;
    if (form.invalid || !this.formSelections.solicitante() || !this.details().length) {
      form.markAllAsTouched(); return;
    }
    if (detailForm?.dirty || this.editingIndex() !== null || this.formSelections.idProducto()) {
      this.alert.error('Agrega o limpia el producto pendiente antes de guardar'); return;
    }
    this.loading.set(true);
    this.requestService.create(this.buildCreateDto(form))
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.success === false) { this.alert.error(res.message || 'No se pudo guardar la solicitud'); return; }
          this.clearDetails();
          this.clearSelections();
          form.reset({ idRecinto: 0, idTipoArticulo: 0, idTipoSolicitud: 0, solicitante: '',
            cargoSolicitante: '', unidadOrganizativa: '', observaciones: '' });
          this.alert.success('Solicitud guardada');
          onSuccess?.();
        },
        error: () => this.alert.error('No se pudo guardar la solicitud. Los datos se conservan para reintentar'),
      });
  }
}
