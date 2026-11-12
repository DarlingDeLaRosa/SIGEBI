import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PurchaseContractForm } from './purchase-contract-form';

describe('Descripción general de la orden de compra', () => {
  const header = {
    noExpediente: 'EXP-1', noOrden: 'OC-1', modalidadCompra: 'Compra directa',
    idProveedor: 1, formaPago: 'Contado', moneda: 'DOP',
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [PurchaseContractForm],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  }));

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  function setup() {
    const fixture = TestBed.createComponent(PurchaseContractForm);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.match(request => request.method === 'GET' && !request.url.includes('/OrdenCompras'))
      .forEach(request => request.flush({ data: [] }));
    const page: HTMLElement = fixture.nativeElement;
    const description = page.querySelector<HTMLTextAreaElement>('#descripcionOrden')!;
    return { fixture, http, description };
  }

  function typeDescription(field: HTMLTextAreaElement, value: string) {
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  it.each(['Compra de materiales', ''])('envía la descripción general %j al crear', value => {
    const { fixture, http, description } = setup();
    const form = fixture.componentInstance;
    form.purchaseContractForm.patchValue(header);
    form.facade.details.set([{
      idProducto: { idProducto: 2 }, idUnidadMe: { idUnidadMe: 3 },
      descripcion: 'Descripción del producto',
    }]);
    typeDescription(description, value);
    form.save();

    const request = http.expectOne(req => req.url.endsWith('/OrdenCompras') && req.method === 'POST');
    expect(request.request.body.descripcion).toBe(value);
    expect(request.request.body.detalles[0].descripcion).toBe('Descripción del producto');
  });

  it('precarga la descripción y envía la edición por PUT', () => {
    const { fixture, http, description } = setup();
    const form = fixture.componentInstance;
    form.loadById(8);
    http.expectOne(req => req.url.endsWith('/OrdenCompras/8'))
      .flush({ data: { ...header, id: 8, descripcion: 'Descripción anterior', detalles: [] } });
    fixture.detectChanges();
    expect(description.value).toBe('Descripción anterior');

    typeDescription(description, 'Descripción actualizada');
    form.save();

    const request = http.expectOne(req => req.url.endsWith('/OrdenCompras') && req.method === 'PUT');
    expect(request.request.body).toMatchObject({ id: 8, descripcion: 'Descripción actualizada' });
  });
});
