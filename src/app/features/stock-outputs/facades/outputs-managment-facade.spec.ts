import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OutputsManagementFacade } from './outputs-managment-facade';
import { RequestsService } from '../../requests/services/requests-service';
import { OutputService } from '../services/output-service';
import { StockOutputService } from '../../maintenance/services/stockOutput/stock-output-service';
import { IntranetService } from '../../../shared/service/general.service';
import { Alert } from '../../../core/service/alert-service/alert';
import { DialogService } from '../../../core/service/dialog-service/dialog';
import { RequestModel } from '../../requests/model/request-model';
import { DispatchProduct, OutputEntry } from '../DTOs/outputs-form-dto';
import { StockOutputsForms } from '../forms/stock-outputs-forms';

const request: RequestModel = { id: 11, noRequerimiento: 'REQ-11', idRecinto: 7,
  recintoObj: { idRecinto: 7, nombre: 'Central' }, idTipoArticulo: 2, tipoArtiucloObj: null,
  idTipoSolicitud: 1, tipoSolicitudObj: null, fecha: '2026-10-01', solicitante: 'Ana Pérez',
  cargoSolicitante: 'Analista', unidadOrganizativa: 'Compras', observaciones: null, idEstado: 1, estadoObj: null,
  detallesSolicitud: [{ id: 3, idProducto: 5, productoObj: null, cantidadSolicitada: 5 }] };
const product: DispatchProduct = { idProducto: 5, nombre: 'Papel', precio: 100, stockPorAlmacen: [
  { idTipoAlmacen: 4, cantidad: 8, tipoAlmacenObj: { idTipoAlm: 4, nombre: 'Principal' } },
] };
const entry: OutputEntry = { idEntradaDet: 9, idEntrada: 2, idTipoAlmacen: 4, producto: { idProducto: 5, nombre: 'Papel' },
  cantidad: 8, marca: 'Marca A', modelo: 'Modelo A', condicion: 'Nuevo', serial: null, precio: 90 };

describe('OutputsManagementFacade', () => {
  let facade: OutputsManagementFacade;
  const requests = { getAll: vi.fn(), getRequestDetails: vi.fn() };
  const service = { getDispatchProduct: vi.fn(), getProductEntries: vi.fn(), createOutput: vi.fn() };
  const alert = { error: vi.fn(), success: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    requests.getRequestDetails.mockReturnValue(of(request));
    requests.getAll.mockReturnValue(of({ success: true, data: [request], cantPage: 2 }));
    service.getDispatchProduct.mockReturnValue(of(product));
    service.getProductEntries.mockReturnValue(of([entry]));
    service.createOutput.mockReturnValue(of({ success: true }));
    TestBed.configureTestingModule({ providers: [provideRouter([]), OutputsManagementFacade,
      { provide: RequestsService, useValue: requests }, { provide: OutputService, useValue: service },
      { provide: StockOutputService, useValue: { getAll: () => of({ success: true, data: [] }) } },
      { provide: IntranetService, useValue: { getAllRecinto: () => of({ success: true, data: [] }) } },
      { provide: Alert, useValue: alert }, { provide: DialogService, useValue: { open: vi.fn() } },
    ] });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    facade = TestBed.inject(OutputsManagementFacade);
  });

  function selectRequest() { facade.loadRequestById(11); }
  function prepare() { selectRequest(); facade.prepareDetail(request.detallesSolicitud![0]); }

  it('filters requests by number and keeps the filter when paging', () => {
    facade.loadRequest(' REQ-11 ');
    facade.changePage(2);
    expect(requests.getAll).toHaveBeenLastCalledWith({ noRequerimiento: 'REQ-11', page: 2, CantItems: 5 });
    facade.changePageSize(10);
    expect(requests.getAll).toHaveBeenLastCalledWith({ noRequerimiento: 'REQ-11', page: 1, CantItems: 10 });
  });

  it('selects a request, opens sections and fills header fields while preserving the editable date', () => {
    expect(facade.form.controls.fechaCreacion.value).toBe(StockOutputsForms.today());
    facade.form.controls.fechaCreacion.setValue('2026-10-20');
    selectRequest();
    expect(facade.form.getRawValue()).toMatchObject({ idSolicitud: 11, idTipoArticulo: 2, idRecinto: 7,
      noRequerimiento: 'REQ-11', solicitante: 'Ana Pérez', solicitanteCargo: 'Analista', unidadOrganizativa: 'Compras', fechaCreacion: '2026-10-20' });
    expect(facade.sectionOpenGeneral()).toBe(true);
    expect(facade.sectionOpenDetail()).toBe(true);
    expect(facade.detailsRequest()[0]).toMatchObject({ id: 3, pendiente: 5 });
  });

  it('prefills all product fields from the only warehouse and entry', () => {
    prepare();
    expect(facade.detailForm.getRawValue()).toMatchObject({ idProducto: 5, nombre: 'Papel', cantidad: 5,
      cantSolicitada: 5, marca: 'Marca A', modelo: 'Modelo A', condicion: 'Nuevo', serial: '', precio: 90,
      idTipoAlmcacen: 4, idEntradaDetalle: 9, requestDetailId: 3 });
    expect(facade.detailForm.dirty).toBe(true);
    expect(service.getProductEntries).toHaveBeenCalledExactlyOnceWith(5, 4);
  });

  it('requires choosing among multiple warehouses and entries instead of selecting an arbitrary serial', () => {
    service.getDispatchProduct.mockReturnValue(of({ ...product, stockPorAlmacen: [...product.stockPorAlmacen!,
      { idTipoAlmacen: 6, cantidad: 2, tipoAlmacenObj: { idTipoAlm: 6, nombre: 'Secundario' } }] }));
    service.getProductEntries.mockReturnValue(of([entry, { ...entry, idEntradaDet: 10, serial: 'SERIAL-10' }]));
    prepare();
    expect(facade.selectedEntry()).toBeNull();
    expect(service.getProductEntries).not.toHaveBeenCalled();
    facade.selectWarehouse(product.stockPorAlmacen![0]);
    expect(facade.selectedEntry()).toBeNull();
    facade.selectEntry(facade.entries()[1]);
    expect(facade.detailForm.controls.serial.value).toBe('SERIAL-10');
    expect(facade.detailForm.controls.cantidad.value).toBe(1);
  });

  it('stages changed details and calculates totals while leaving the original request intact', () => {
    prepare();
    facade.detailForm.patchValue({ cantidad: 3, precio: 80, marca: 'Marca cambiada' });
    facade.addDetail();
    expect(facade.details()[0]).toMatchObject({ cantidad: 3, precio: 80, marca: 'Marca cambiada', subTotal: 240 });
    expect(facade.total()).toBe(240);
    expect(facade.detailsRequest()[0].pendiente).toBe(2);
    expect(request.detallesSolicitud![0].cantidadSolicitada).toBe(5);
    expect(facade.detailForm.pristine).toBe(true);
  });

  it('rejects zero, excessive requested quantities and excessive warehouse stock', () => {
    prepare();
    facade.detailForm.controls.cantidad.setValue(0);
    facade.addDetail();
    expect(alert.error).toHaveBeenLastCalledWith('La cantidad no puede ser 0');
    facade.detailForm.controls.cantidad.setValue(6);
    facade.addDetail();
    expect(alert.error).toHaveBeenLastCalledWith('La cantidad supera lo pendiente de la solicitud');
    facade.selectedProduct.set({ ...product, stockPorAlmacen: [{ ...product.stockPorAlmacen![0], cantidad: 2 }] });
    facade.detailForm.controls.cantidad.setValue(3);
    facade.addDetail();
    expect(alert.error).toHaveBeenLastCalledWith('La cantidad supera la existencia disponible del almacén');
    expect(facade.details()).toEqual([]);
  });

  it('does not allow replacing the request or a pending detail without clearing it', () => {
    prepare();
    facade.loadRequestById(12);
    expect(requests.getRequestDetails).toHaveBeenCalledTimes(1);
    facade.prepareDetail(request.detallesSolicitud![0]);
    expect(service.getDispatchProduct).toHaveBeenCalledTimes(1);
  });

  it('edits in place, keeps the original on cancellation and restores pending quantities on removal', () => {
    prepare();
    facade.detailForm.controls.cantidad.setValue(3);
    facade.addDetail();
    const rowId = facade.details()[0].rowId;
    facade.editDetail(0);
    facade.detailForm.controls.cantidad.setValue(2);
    facade.clearDetail();
    expect(facade.details()[0].cantidad).toBe(3);
    facade.editDetail(0);
    facade.detailForm.controls.cantidad.setValue(4);
    facade.addDetail();
    expect(facade.details()).toHaveLength(1);
    expect(facade.details()[0]).toMatchObject({ rowId, cantidad: 4 });
    facade.removeDetail(0);
    expect(facade.detailsRequest()[0].pendiente).toBe(5);
  });

  it('maps precisely the POST contract without UI objects or misleading field names', () => {
    prepare();
    facade.addDetail();
    facade.form.patchValue({ idTipoSalida: 1, fechaCreacion: '2026-10-20' });
    facade.save();
    expect(service.createOutput).toHaveBeenCalledWith({ idSolicitud: 11, idRecinto: 7, idTipoArticulo: 2,
      idTipoSalida: 1, noRequerimiento: 'REQ-11', solicitante: 'Ana Pérez', solicitanteCargo: 'Analista',
      unidadOrganizativa: 'Compras', observacion: '', fechaCreacion: '2026-10-20T00:00:00', total: 450,
      detalles: [{ idSalida: 0, idProducto: 5, marca: 'Marca A', modelo: 'Modelo A', serial: '',
        cantSolicitada: 5, cantidadDespachada: 5, precio: 90, subTotal: 450, idTipoAlmcacen: 4 }] });
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/layout/salidas/Salidas']);
  });

  it('preserves data on save failure and prevents duplicate submissions', () => {
    prepare(); facade.addDetail(); facade.form.controls.idTipoSalida.setValue(1);
    const pending = new Subject<any>();
    service.createOutput.mockReturnValue(pending);
    facade.save(); facade.save();
    expect(service.createOutput).toHaveBeenCalledOnce();
    expect(facade.saving()).toBe(true);
    pending.error(new Error('Failure'));
    expect(facade.saving()).toBe(false);
    expect(facade.details()).toHaveLength(1);
    expect(alert.error).toHaveBeenLastCalledWith('No se pudo guardar la salida. Los datos se conservan para volver a intentar');
  });

  it('keeps missing request fields empty and does not make a speculative person lookup', () => {
    requests.getRequestDetails.mockReturnValue(of({ ...request, idRecinto: null, unidadOrganizativa: null }));
    selectRequest();
    expect(facade.form.controls.idRecinto.value).toBe(0);
    expect(facade.form.controls.unidadOrganizativa.value).toBe('');
    expect(facade.form.invalid).toBe(true);
  });

  it('handles failed product and entry lookups without staging a detail', () => {
    service.getDispatchProduct.mockReturnValue(throwError(() => new Error('Failure')));
    prepare();
    expect(facade.loadingDetail()).toBe(false);
    expect(facade.details()).toEqual([]);
    expect(alert.error).toHaveBeenLastCalledWith('No se pudo cargar el producto para despachar');
  });
});
