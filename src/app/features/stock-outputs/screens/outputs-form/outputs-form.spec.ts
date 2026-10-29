import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OutputsForm } from './outputs-form';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { Alert } from '../../../../core/service/alert-service/alert';
import { environment } from '../../../../../environments/environment';

const request = { id: 11, noRequerimiento: 'REQ-11', idRecinto: 7, idTipoArticulo: 2,
  recintoObj: null, solicitante: 'Ana Pérez', cargoSolicitante: 'Analista', unidadOrganizativa: 'Compras',
  detallesSolicitud: [{ id: 3, idProducto: 5, productoObj: { nombre: 'Papel' }, cantidadSolicitada: 5 }] };
const product = { idProducto: 5, nombre: 'Papel', precio: 100, stockPorAlmacen: [
  { idTipoAlmacen: 4, cantidad: 8, tipoAlmacenObj: { idTipoAlm: 4, nombre: 'Principal' } },
] };
const entry = { idEntradaDet: 9, idEntrada: 2, idTipoAlmacen: 4, producto: { idProducto: 5, nombre: 'Papel' },
  cantidad: 8, marca: 'Marca A', modelo: 'Modelo A', condicion: 'Nuevo', serial: null, precio: 90 };
const requestsEndpoint = `${environment.apiUrl}/Solicitudes`;

describe('OutputsForm request workflow', () => {
  let fixture: ComponentFixture<OutputsForm>;
  let http: HttpTestingController;
  const alert = { error: vi.fn(), success: vi.fn() };
  beforeEach(async () => {
    alert.error.mockClear(); alert.success.mockClear();
    await TestBed.configureTestingModule({ imports: [OutputsForm], providers: [
      provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      { provide: Alert, useValue: alert }, { provide: DialogService, useValue: { open: vi.fn() } },
    ] }).compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });

  function create() {
    fixture = TestBed.createComponent(OutputsForm);
    fixture.detectChanges();
    http.expectOne(requestsEndpoint).flush({ success: true, data: [request], cantPage: 1, currentPage: 1 });
    http.expectOne(req => req.url === `${environment.apiUrl}/TipoSalida`)
      .flush({ success: true, data: [{ idTipoSalida: 1, nombre: 'Consumo' }] });
    http.expectOne(`${environment.apiUrlIntranet}/GenericService/getallrecintos`)
      .flush({ success: true, data: [{ idRecinto: 7, nombre: 'Central' }] });
  }

  function selectRequest() {
    fixture.detectChanges();
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    table.actions()[0].action({ row: request, index: 0 });
    http.expectOne(`${requestsEndpoint}/11`).flush({ success: true, data: request });
    fixture.detectChanges();
    expect(table.selectedRowId()).toBe(11);
  }

  function dispatchProduct() {
    const table = fixture.debugElement.queryAll(By.directive(TableOfContent))
      .map(item => item.componentInstance as TableOfContent).find(item => item.trackByField() === 'id' && item.actions()[0]?.label === 'Dar salida')!;
    table.actions()[0].action({ row: table.tableData()[0], index: 0 });
    http.expectOne(`${environment.apiUrl}/Producto/5`).flush({ success: true, data: product });
    http.expectOne(`${environment.apiUrl}/Entrada/by_idproducto_idtipoalmacen/5/4`).flush({ success: true, data: [entry] });
    fixture.detectChanges();
  }

  it('filters by request number using POST and accepts selection through the table action', () => {
    create();
    fixture.componentInstance.searchForm.controls.noRequerimiento.setValue('REQ-11');
    fixture.componentInstance.searchRequests();
    const search = http.expectOne(requestsEndpoint);
    expect(search.request.method).toBe('POST');
    expect(search.request.body.noRequerimiento).toBe('REQ-11');
    search.flush({ success: true, data: [request], cantPage: 1 });
    selectRequest();
    expect((fixture.nativeElement.querySelector('#noreq') as HTMLInputElement).value).toBe('REQ-11');
    expect((fixture.nativeElement.querySelector('#output-campus') as HTMLInputElement).value).toBe('Central');
    expect((fixture.nativeElement.querySelector('#output-department') as HTMLInputElement).value).toBe('Compras');
    expect((fixture.nativeElement.querySelector('#fechaSalida') as HTMLInputElement).readOnly).toBe(false);
    http.expectNone(req => req.url.includes('/Persona/'));
  });

  it('prefills, edits and stages the product, then saves exactly once through POST Salida', () => {
    create(); selectRequest(); dispatchProduct();
    expect((fixture.nativeElement.querySelector('#marca') as HTMLInputElement).value).toBe('Marca A');
    expect((fixture.nativeElement.querySelector('#modelo') as HTMLInputElement).value).toBe('Modelo A');
    expect((fixture.nativeElement.querySelector('#precio') as HTMLInputElement).value).toBe('90');
    expect(fixture.nativeElement.querySelectorAll('form form').length).toBe(0);
    const facade = fixture.componentInstance.facade;
    facade.detailForm.patchValue({ cantidad: 3, modelo: 'Modelo modificado' });
    facade.addDetail();
    fixture.detectChanges();
    const dispatch = fixture.debugElement.queryAll(By.directive(TableOfContent))
      .map(item => item.componentInstance as TableOfContent).find(item => item.tableTitle() === 'Productos a despachar')!;
    expect(dispatch.tableData()[0]).toMatchObject({ cantidad: 3, modelo: 'Modelo modificado', subTotal: 270 });
    const type = fixture.debugElement.queryAll(By.directive(SearchSelect)).map(item => item.componentInstance as SearchSelect)
      .find(item => item.placeholder === 'Tipo de salida *')!;
    type.selected.emit({ idTipoSalida: 1, nombre: 'Consumo' });
    facade.save(); facade.save();
    const save = http.expectOne(`${environment.apiUrl}/Salida`);
    expect(save.request.method).toBe('POST');
    expect(save.request.body).toMatchObject({ idSolicitud: 11, idRecinto: 7, unidadOrganizativa: 'Compras',
      detalles: [{ idProducto: 5, cantidadDespachada: 3, cantSolicitada: 5, modelo: 'Modelo modificado', idTipoAlmcacen: 4 }] });
    expect(save.request.body.detalles[0]).not.toHaveProperty('warehouseName');
    save.flush({ success: true, data: { idSalida: 1 } });
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/layout/salidas/Salidas']);
  });

  it('accepts request navigation state from the request listing', () => {
    vi.spyOn(history, 'state', 'get').mockReturnValue({ requestId: 11 });
    create();
    http.expectOne(`${requestsEndpoint}/11`).flush({ success: true, data: request });
    fixture.detectChanges();
    expect(fixture.componentInstance.facade.selectedRequest()?.id).toBe(11);
  });

  it('keeps staged data when the backend reports a failed save', () => {
    create(); selectRequest(); dispatchProduct();
    const facade = fixture.componentInstance.facade;
    facade.addDetail(); facade.form.controls.idTipoSalida.setValue(1);
    facade.save();
    http.expectOne(`${environment.apiUrl}/Salida`).flush({ success: false, data: null, message: 'No permitido' });
    expect(facade.details()).toHaveLength(1);
    expect(facade.saving()).toBe(false);
    expect(alert.error).toHaveBeenCalledWith('No se pudo guardar la salida. Los datos se conservan para volver a intentar');
  });
});
