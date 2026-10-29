import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CONDITION } from '../../../shared/constant/select-options';
import { TableAction } from '../../../interfaces/table-content-interface';
import { Alert } from '../../../core/service/alert-service/alert';
import { DialogService } from '../../../core/service/dialog-service/dialog';
import { IntranetService } from '../../../shared/service/general.service';
import { RequestsService } from '../../requests/services/requests-service';
import { RequestDetail, RequestModel } from '../../requests/model/request-model';
import { RequestDetail as RequestDetailDialog } from '../../requests/dialog/request-detail/request-detail';
import { StockOutputService } from '../../maintenance/services/stockOutput/stock-output-service';
import { OutputService } from '../services/output-service';
import { StockOutputsForms } from '../forms/stock-outputs-forms';
import { CreateOutputDto, DispatchDetail, DispatchProduct, OutputEntry, OutputStock } from '../DTOs/outputs-form-dto';

@Injectable()
export class OutputsManagementFacade {
  private requestService = inject(RequestsService);
  private outputService = inject(OutputService);
  private outputTypeService = inject(StockOutputService);
  private intranet = inject(IntranetService);
  private dialog = inject(DialogService);
  private alert = inject(Alert);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private requestQuery?: Subscription;
  private selectedRequestQuery?: Subscription;
  private productQuery?: Subscription;
  private entriesQuery?: Subscription;
  private nextRowId = 1;

  readonly form = StockOutputsForms.createForm(this.fb);
  readonly detailForm = StockOutputsForms.createDetailForm(this.fb);
  readonly loading = signal(false);
  readonly loadingDetail = signal(false);
  readonly loadingEntries = signal(false);
  readonly saving = signal(false);
  readonly sectionOpen = signal(true);
  readonly sectionOpenGeneral = signal(false);
  readonly sectionOpenDetail = signal(false);
  readonly request = signal<RequestModel[]>([]);
  readonly selectedRequest = signal<RequestModel | null>(null);
  readonly selectedProduct = signal<DispatchProduct | null>(null);
  readonly selectedEntry = signal<OutputEntry | null>(null);
  readonly selectedStock = signal<OutputStock | null>(null);
  readonly outputTypes = signal<{ idTipoSalida: number; nombre: string }[]>([]);
  readonly recintos = signal<{ idRecinto: number; nombre: string }[]>([]);
  readonly entries = signal<OutputEntry[]>([]);
  readonly details = signal<DispatchDetail[]>([]);
  readonly editingIndex = signal<number | null>(null);
  readonly activeDetailId = signal<number | null>(null);
  readonly condition = CONDITION;
  readonly pagination = signal({ currentPage: 1, pageSize: 5, totalPages: 1 });
  private appliedSearch = '';

  readonly warehouseOptions = computed(() => (this.selectedProduct()?.stockPorAlmacen ?? [])
    .filter(stock => stock.cantidad > 0)
    .map(stock => ({ ...stock, nombre: stock.tipoAlmacenObj?.nombre || `Almacén #${stock.idTipoAlmacen}` })));
  readonly detailsRequest = computed(() => (this.selectedRequest()?.detallesSolicitud ?? [])
    .map(detail => ({ ...detail, nombre: detail.productoObj?.nombre || `Producto #${detail.idProducto}`,
      pendiente: Math.max(0, (detail.cantidadSolicitada ?? 0) - this.details()
        .filter(item => item.requestDetailId === detail.id).reduce((sum, item) => sum + item.cantidad, 0)) })));
  readonly total = computed(() => this.details().reduce((sum, item) => sum + item.subTotal, 0));
  readonly actions: TableAction[] = [{ label: 'Crear salida', icon: 'bi bi-box-seam',
    class: 'item-createEntry', action: event => this.loadRequestById(event.row.id) }];
  readonly actionsDetails: TableAction[] = [{ label: 'Dar salida', icon: 'bi bi-box-seam',
    class: 'item-createEntry', visible: row => row.pendiente > 0,
    action: event => this.prepareDetail(event.row) }];

  loadData() {
    this.loadRequest();
    this.loadOutputTypes();
    this.intranet.getAllRecinto().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (response.success === false) { this.alert.error('No se pudieron cargar los recintos'); return; }
        this.recintos.set(response.data ?? []);
      }, error: () => this.alert.error('No se pudieron cargar los recintos'),
    });
  }

  loadOutputTypes(filter = '') {
    this.outputTypeService.getAll({ filter, page: 1, CantItems: 10 })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: response => {
          if (response.success === false) { this.alert.error('No se pudieron cargar los tipos de salida'); return; }
          this.outputTypes.set(response.data ?? []);
        }, error: () => this.alert.error('No se pudieron cargar los tipos de salida'),
      });
  }

  loadRequest(filter = this.appliedSearch, page = 1) {
    this.requestQuery?.unsubscribe();
    this.appliedSearch = filter.trim();
    this.requestQuery = this.requestService.getAll({ noRequerimiento: this.appliedSearch,
      page, CantItems: this.pagination().pageSize }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.request.set(response.data ?? []);
        this.pagination.update(value => ({ ...value, currentPage: page, totalPages: response.cantPage }));
      }, error: () => this.alert.error('No se pudieron cargar las solicitudes'),
    });
  }

  changePage(page: number) { this.loadRequest(this.appliedSearch, page); }
  changePageSize(pageSize: number) {
    this.pagination.update(value => ({ ...value, pageSize }));
    this.loadRequest(this.appliedSearch);
  }

  loadRequestById(id: number) {
    if (this.saving() || id === this.selectedRequest()?.id) return;
    if (this.details().length || this.detailForm.dirty) {
      this.alert.error('Elimina los productos a despachar y limpia el detalle pendiente antes de cambiar de solicitud'); return;
    }
    this.selectedRequestQuery?.unsubscribe();
    this.loading.set(true);
    this.selectedRequestQuery = this.requestService.getRequestDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
        next: request => {
          if (!request) { this.alert.error('No se encontró la solicitud'); return; }
          this.clearDetail();
          this.selectedRequest.set(request);
          this.form.patchValue({ idSolicitud: request.id, idTipoArticulo: request.idTipoArticulo ?? 0,
            idRecinto: request.idRecinto ?? 0, noRequerimiento: request.noRequerimiento ?? '',
            solicitante: request.solicitante ?? '', solicitanteCargo: request.cargoSolicitante ?? '',
            unidadOrganizativa: request.unidadOrganizativa ?? '' });
          this.sectionOpenGeneral.set(true);
          this.sectionOpenDetail.set(true);
          if (!this.request().some(item => item.id === request.id)) this.request.update(items => [request, ...items]);
        }, error: () => this.alert.error('No se pudo cargar la solicitud'),
      });
  }

  prepareDetail(detail: RequestDetail) {
    if (this.saving() || this.loading() || !detail.idProducto) return;
    if (this.detailForm.dirty) { this.alert.error('Agrega o limpia el detalle pendiente antes de seleccionar otro'); return; }
    const pending = this.remainingRequested(detail.id);
    if (pending <= 0) { this.alert.error('La cantidad solicitada ya está incluida en los productos a despachar'); return; }
    this.clearDetail();
    this.activeDetailId.set(detail.id);
    this.loadingDetail.set(true);
    this.productQuery = this.outputService.getDispatchProduct(detail.idProducto)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingDetail.set(false))).subscribe({
        next: product => {
          this.selectedProduct.set(product);
          this.detailForm.patchValue({ requestDetailId: detail.id, idProducto: product.idProducto,
            nombre: product.nombre, cantSolicitada: detail.cantidadSolicitada ?? 0, cantidad: pending, precio: product.precio ?? 0 });
          this.detailForm.markAsDirty();
          this.sectionOpenDetail.set(true);
          const options = this.warehouseOptions();
          if (options.length === 1) this.selectWarehouse(options[0]);
          else if (!options.length) this.alert.error('Este producto no tiene existencia disponible en almacén');
        }, error: () => { this.activeDetailId.set(null); this.alert.error('No se pudo cargar el producto para despachar'); },
      });
  }

  selectWarehouse(stock: OutputStock | null) {
    this.entriesQuery?.unsubscribe();
    this.entries.set([]);
    this.selectedEntry.set(null);
    this.selectedStock.set(stock || null);
    this.detailForm.patchValue({ idTipoAlmcacen: stock?.idTipoAlmacen ?? 0, idEntradaDetalle: 0,
      marca: '', modelo: '', condicion: '', serial: '' });
    this.detailForm.markAsDirty();
    const product = this.selectedProduct();
    if (!stock || !product) return;
    this.loadingEntries.set(true);
    this.entriesQuery = this.outputService.getProductEntries(product.idProducto, stock.idTipoAlmacen)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingEntries.set(false))).subscribe({
        next: entries => {
          const matching = entries.filter(entry => entry.producto?.idProducto === product.idProducto && entry.idTipoAlmacen === stock.idTipoAlmacen);
          this.entries.set(matching);
          if (matching.length === 1) this.selectEntry(matching[0]);
          else if (!matching.length) this.alert.error('No hay entradas disponibles para este producto y almacén');
        }, error: () => this.alert.error('No se pudieron cargar las entradas del producto'),
      });
  }

  selectEntry(entry: OutputEntry | null) {
    this.selectedEntry.set(entry || null);
    const stock = this.selectedStock();
    this.detailForm.patchValue({ idEntradaDetalle: entry?.idEntradaDet ?? 0,
      marca: entry?.marca ?? '', modelo: entry?.modelo ?? '', condicion: entry?.condicion ?? '', serial: entry?.serial ?? '',
      precio: entry?.precio ?? this.selectedProduct()?.precio ?? 0 });
    if (entry && stock) this.detailForm.patchValue({ cantidad: Math.min(this.remainingRequested(this.activeDetailId()!),
      this.remainingStock(stock.idTipoAlmacen, this.selectedProduct()!.idProducto), entry.serial ? 1 : Number.MAX_SAFE_INTEGER) });
    this.detailForm.markAsDirty();
  }

  private remainingRequested(id: number) {
    const requested = this.selectedRequest()?.detallesSolicitud?.find(item => item.id === id)?.cantidadSolicitada ?? 0;
    return requested - this.details().filter((item, index) => item.requestDetailId === id && index !== this.editingIndex())
      .reduce((sum, item) => sum + item.cantidad, 0);
  }

  private remainingStock(warehouseId: number, productId: number) {
    const quantity = this.selectedProduct()?.stockPorAlmacen?.find(stock => stock.idTipoAlmacen === warehouseId)?.cantidad ?? 0;
    return quantity - this.details().filter((item, index) => item.idProducto === productId && item.idTipoAlmcacen === warehouseId && index !== this.editingIndex())
      .reduce((sum, item) => sum + item.cantidad, 0);
  }

  addDetail() {
    if (this.saving() || this.loadingDetail() || this.loadingEntries()) return;
    const value = this.detailForm.getRawValue();
    if (value.cantidad === 0) { this.alert.error('La cantidad no puede ser 0'); return; }
    if (this.detailForm.invalid || !this.selectedEntry() || !this.selectedStock()) {
      this.detailForm.markAllAsTouched(); this.alert.error('Selecciona una entrada y completa los datos del producto'); return;
    }
    if (value.cantidad > this.remainingRequested(value.requestDetailId)) {
      this.alert.error('La cantidad supera lo pendiente de la solicitud'); return;
    }
    if (value.cantidad > this.remainingStock(value.idTipoAlmcacen, value.idProducto)) {
      this.alert.error('La cantidad supera la existencia disponible del almacén'); return;
    }
    if (value.serial && this.details().some((item, index) => index !== this.editingIndex() && item.serial === value.serial && item.idProducto === value.idProducto)) {
      this.alert.error('Este serial ya está incluido en los productos a despachar'); return;
    }
    if (value.serial && value.cantidad !== 1) { this.alert.error('Un producto con serial debe despacharse de uno en uno'); return; }
    const editing = this.editingIndex();
    const detail: DispatchDetail = { ...value,
      rowId: editing === null ? this.nextRowId++ : this.details()[editing].rowId,
      warehouseName: this.selectedStock()?.tipoAlmacenObj?.nombre ?? '',
      subTotal: Math.round(value.cantidad * value.precio * 100) / 100 };
    this.details.update(items => editing === null ? [...items, detail] : items.map((item, index) => index === editing ? detail : item));
    this.clearDetail();
  }

  editDetail(index: number) {
    if (this.saving() || this.detailForm.dirty) { this.alert.error('Agrega o limpia el detalle pendiente antes de editar otro'); return; }
    const detail = this.details()[index];
    if (!detail) return;
    this.productQuery?.unsubscribe();
    this.loadingDetail.set(true);
    this.productQuery = this.outputService.getDispatchProduct(detail.idProducto)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingDetail.set(false))).subscribe({
        next: product => {
          this.selectedProduct.set(product);
          this.editingIndex.set(index);
          this.activeDetailId.set(detail.requestDetailId);
          this.selectedStock.set(product.stockPorAlmacen?.find(stock => stock.idTipoAlmacen === detail.idTipoAlmcacen) ?? null);
          const entry: OutputEntry = { idEntradaDet: detail.idEntradaDetalle, idEntrada: null, idTipoAlmacen: detail.idTipoAlmcacen,
            producto: { idProducto: detail.idProducto, nombre: detail.nombre }, cantidad: null,
            marca: detail.marca, modelo: detail.modelo, condicion: detail.condicion, serial: detail.serial, precio: detail.precio };
          this.entries.set([entry]);
          this.selectedEntry.set(entry);
          this.detailForm.reset(detail);
          this.detailForm.markAsDirty();
        }, error: () => this.alert.error('No se pudo cargar el producto para editar'),
      });
  }

  removeDetail(index: number) {
    if (this.saving()) return;
    this.details.update(items => items.filter((_, position) => position !== index));
    this.clearDetail();
  }

  clearDetail() {
    this.productQuery?.unsubscribe();
    this.entriesQuery?.unsubscribe();
    this.selectedProduct.set(null);
    this.selectedEntry.set(null);
    this.selectedStock.set(null);
    this.entries.set([]);
    this.editingIndex.set(null);
    this.activeDetailId.set(null);
    this.detailForm.reset();
  }

  buildCreateDto(): CreateOutputDto {
    return { ...this.form.getRawValue(), total: this.total(), fechaCreacion: `${this.form.controls.fechaCreacion.value}T00:00:00`,
      detalles: this.details().map(detail => ({ idSalida: 0, idProducto: detail.idProducto,
        marca: detail.marca.trim(), modelo: detail.modelo.trim(), serial: detail.serial.trim(),
        cantSolicitada: detail.cantSolicitada, cantidadDespachada: detail.cantidad, precio: detail.precio,
        subTotal: detail.subTotal, idTipoAlmcacen: detail.idTipoAlmcacen })) };
  }

  save() {
    if (this.saving() || this.loading() || this.loadingDetail() || this.loadingEntries()) return;
    if (!this.selectedRequest() || this.form.invalid || !this.details().length) {
      this.form.markAllAsTouched(); this.alert.error('Completa la información general y agrega productos a despachar'); return;
    }
    if (this.detailForm.dirty) { this.alert.error('Agrega o limpia el detalle pendiente antes de guardar'); return; }
    this.saving.set(true);
    this.outputService.createOutput(this.buildCreateDto())
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false))).subscribe({
        next: () => { this.alert.success('Salida guardada'); this.router.navigate(['/layout/salidas/Salidas']); },
        error: () => this.alert.error('No se pudo guardar la salida. Los datos se conservan para volver a intentar'),
      });
  }

  openDialog(id: number) { this.dialog.open(RequestDetailDialog, id); }
}
