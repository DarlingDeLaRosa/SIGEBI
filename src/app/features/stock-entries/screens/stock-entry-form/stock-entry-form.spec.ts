import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Alert } from '../../../../core/service/alert-service/alert';
import { StockEntryForm } from './stock-entry-form';

describe('Saldo pendiente de la entrada', () => {
  const alert = { error: vi.fn(), success: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [StockEntryForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: Alert, useValue: alert }],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  function setup(balance: number | null = 6, original: { idDetalleOrden?: number; cantidad: number }[] = [],
    duplicateProduct = true, fail = false) {
    const fixture = TestBed.createComponent(StockEntryForm);
    const screen = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);
    const line = {
      idOrdenCompra: 40, idProducto: 2, calCantidad: balance, cantidad: 10,
      productoObj: { nombre: 'Artículo', precio: 10, itbis: 0 },
    };
    const otherLine = { ...line, idOrdenCompra: 41, idProducto: duplicateProduct ? 2 : 3, calCantidad: 2 };
    fixture.detectChanges();
    http.match(() => true).forEach(request => request.flush({ data: [] }));
    if (original.length) {
      screen.facade.loadStockEntryHead({ data: {
        idEntrada: 7, idOrdenCompra: 12,
        detalles: original.map((row, index) => ({
          idEntradaDet: index + 1, producto: { idProducto: 2, nombre: 'Artículo' },
          precio: 10, marca: 'Marca', modelo: 'Modelo', condicion: 'Nuevo',
          tipoAlmacenObj: { idTipoAlm: 1, nombre: 'Almacén' }, ...row,
        })),
      } }, screen.stockEntryForm);
    } else {
      screen.facade.loadPurchaseContractById(12);
    }
    const request = http.expectOne(req => req.url.endsWith('/OrdenCompras/12'));
    if (fail) request.flush(null, { status: 500, statusText: 'Error' });
    else request.flush({
      data: { id: 12, idProveedor: 1, total: 100, detalles: [line, otherLine] },
    });
    fixture.detectChanges();
    screen.stockEntryForm.patchValue({
      noFactura: 'F1', fechaFactura: '2026-11-12', idTipoEntrada: 1, idTipoEntrega: 1,
    });
    return { fixture, screen, http };
  }

  it.each([[3, 8], [0, 5], [0, 4]])('valida la edición con saldo %s y cantidad %s', (balance, quantity) => {
    const { screen } = setup(balance, [{ cantidad: 5 }], false);
    const { facade, stockEntryDetailForm: form } = screen;
    facade.editDetail({ row: facade.details()[0] }, form);
    expect(form.controls.idDetalleOrden.value).toBe(40);
    expect(facade.pendingQuantity()).toBe(balance + 5);
    form.patchValue({ cantidad: balance + 6 });
    facade.addDetail(form);
    expect(form.controls.cantidad.value).toBe(balance + 6);
    expect(facade.details()[0].cantidad).toBe(5);
    form.patchValue({ cantidad: quantity });
    facade.addDetail(form);
    expect(facade.details()[0].cantidad).toBe(quantity);
    expect(facade.validateDetails()).toBe(true);
  });

  it('comparte el saldo entre los detalles de la misma línea', () => {
    const { screen } = setup(3, [{ idDetalleOrden: 40, cantidad: 5 }, { idDetalleOrden: 40, cantidad: 2 }]);
    const { facade, stockEntryDetailForm: form } = screen;
    facade.editDetail({ row: facade.details()[0] }, form);
    expect(facade.pendingQuantity()).toBe(8);
    form.patchValue({ cantidad: 8 });
    facade.addDetail(form);
    facade.editDetail({ row: facade.details()[1] }, form);
    expect(facade.pendingQuantity()).toBe(2);
    facade.clearDetailForm(form);
    expect(facade.validateDetails()).toBe(true);
  });

  it.each([false, true])('conserva la cantidad si el vínculo es ambiguo o falla la consulta (%s)', fail => {
    const { screen } = setup(3, [{ cantidad: 5 }], true, fail);
    const { facade, stockEntryDetailForm: form } = screen;
    facade.editDetail({ row: facade.details()[0] }, form);
    form.patchValue({ cantidad: 6 });
    facade.addDetail(form);
    expect(alert.error).toHaveBeenLastCalledWith(fail
      ? 'No se pudo confirmar la cantidad pendiente de recibir.'
      : 'No se pudo identificar una única línea de la orden de compra para este detalle.');
    expect(form.controls.cantidad.value).toBe(6);
    expect(facade.details()[0].cantidad).toBe(5);
  });

  it('bloquea el exceso, conserva el formulario y separa dos líneas del mismo producto', () => {
    const { fixture, screen, http } = setup();
    const { facade, stockEntryDetailForm: detail } = screen;
    facade.actionsDetails[0].action({ row: facade.detailsPurchasesDetails()[0], index: 0 });
    fixture.detectChanges();
    expect(detail.controls.cantidad.value).toBe(6);
    detail.patchValue({ cantidad: 7, marca: 'Marca', modelo: 'Modelo', condicion: 'Nuevo', idTipoAlmcacen: 'Almacén' });
    facade.addDetail(detail);
    expect(alert.error).toHaveBeenCalledWith('La cantidad no puede ser mayor que la pendiente de recibir (6).');
    expect(facade.details()).toHaveLength(0);
    expect(detail.controls.cantidad.value).toBe(7);

    detail.patchValue({ cantidad: 6 });
    facade.addDetail(detail);
    facade.actionsDetails[0].action({ row: facade.detailsPurchasesDetails()[0], index: 0 });
    fixture.detectChanges();
    expect(detail.controls.cantidad.value).toBe(2);
    facade.clearDetailForm(detail);

    const row = facade.details()[0];
    facade.editDetail({ row, index: 0 }, detail);
    detail.patchValue({ cantidad: 5 });
    facade.addDetail(detail);
    expect(facade.details().map(item => item.cantidad)).toEqual([5]);
    facade.details.set([{ ...row, cantidad: 7 }]);
    screen.save();
    http.expectNone(req => req.method === 'POST' && req.url.endsWith('/Entrada'));
  });

  it('limita a una unidad los detalles con número de serie', () => {
    const { fixture, screen, http } = setup();
    const { facade, stockEntryDetailForm: detail } = screen;
    facade.actionsDetails[0].action({ row: facade.detailsPurchasesDetails()[0], index: 0 });
    fixture.detectChanges();
    detail.patchValue({
      cantidad: 2, serial: ' ABC ', marca: 'Marca', modelo: 'Modelo',
      condicion: 'Nuevo', idTipoAlmcacen: 'Almacén',
    });
    facade.addDetail(detail);
    expect(alert.error).toHaveBeenCalledWith('La cantidad no puede ser mayor que 1 cuando se indica un número de serie.');
    expect(facade.details()).toHaveLength(0);
    detail.patchValue({ cantidad: 1 });
    facade.addDetail(detail);
    expect(facade.details()).toHaveLength(1);

    facade.details.update(rows => [{ ...rows[0], cantidad: 2 }]);
    screen.save();
    http.expectNone(req => req.method === 'POST' && req.url.endsWith('/Entrada'));
  });

  it.each([0, null])('bloquea una línea con saldo %s', balance => {
    const { screen } = setup(balance);
    const facade = screen.facade;
    facade.actionsDetails[0].action({ row: facade.detailsPurchasesDetails()[0], index: 0 });
    expect(alert.error).toHaveBeenCalledOnce();
    expect(facade.selectedDetail()).toBeNull();
    expect(facade.detailsPurchasesDetails()).toHaveLength(2);
  });
});
