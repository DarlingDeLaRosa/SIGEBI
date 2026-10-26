import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestForm } from './request-form';
import { Alert } from '../../../../core/service/alert-service/alert';
import { environment } from '../../../../../environments/environment';

describe('RequestForm', () => {
  let fixture: ComponentFixture<RequestForm>;
  let http: HttpTestingController;
  const alert = { error: vi.fn(), success: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({ imports: [RequestForm], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
      { provide: Alert, useValue: alert },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RequestForm);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrlIntranet}/GenericService/getallrecintos`).flush({ data: [{ idRecinto: 1, nombre: 'Recinto' }] });
    http.expectOne(`${environment.apiUrl}/Solicitudes/tipo_solicitudes`).flush({ success: true, data: [{ id: 3, nombre: 'Solicitud' }] });
    http.expectOne(req => req.url === `${environment.apiUrl}/TipoArticulo`).flush({ data: [{ idTipoArt: 2, nombre: 'Materiales' }] });
    http.expectOne(req => req.url === `${environment.apiUrl}/Producto`).flush({ data: [{ idProducto: 1, nombre: 'Papel', stock: 2 }] });
    fixture.detectChanges();
  });

  afterEach(() => { vi.useRealTimers(); http.verify(); });

  it('renders separate forms and readonly applicant fields', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('form form')).toHaveLength(0);
    expect(element.querySelector('input[formControlName="cargoSolicitante"]')?.hasAttribute('readonly')).toBe(true);
    expect(element.querySelector('input[formControlName="unidadOrganizativa"]')?.hasAttribute('readonly')).toBe(true);
    expect(fixture.componentInstance.facade.tipoSolicitud()[0].id).toBe(3);
  });

  it('debounces product search once and sends the name as filter', () => {
    vi.useFakeTimers();
    const input = fixture.nativeElement.querySelector('input[placeholder="Producto"]') as HTMLInputElement;
    input.value = 'Pap'; input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    input.value = 'Papel'; input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(499);
    http.expectNone(req => req.url === `${environment.apiUrl}/Producto`);
    vi.advanceTimersByTime(1);
    const req = http.expectOne(req => req.url === `${environment.apiUrl}/Producto`);
    expect(req.request.params.get('filter')).toBe('Papel');
    req.flush({ data: [] });
  });

  it('adds a product without submitting the general form', () => {
    const component = fixture.componentInstance;
    component.facade.selectProduct({ idProducto: 1, nombre: 'Papel', stock: 2 }, component.requestDetailForm);
    component.requestDetailForm.patchValue({ cantidadSolicitada: 8 });
    fixture.detectChanges();
    const forms = fixture.nativeElement.querySelectorAll('form');
    forms[1].querySelector('button[type="submit"]').click();
    expect(component.facade.details()).toHaveLength(1);
    http.expectNone(req => req.method === 'POST');
  });

  it('marks an unselected search as pending and cancels it when cleared', () => {
    vi.useFakeTimers();
    const input = fixture.nativeElement.querySelector('input[placeholder="Producto"]') as HTMLInputElement;
    input.value = 'Papel'; input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.requestDetailForm.dirty).toBe(true);
    const form = fixture.nativeElement.querySelectorAll('form')[1];
    form.querySelector('app-form-actions button[type="button"]').click();
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(fixture.componentInstance.requestDetailForm.pristine).toBe(true);
    vi.advanceTimersByTime(500);
    http.expectNone(req => req.url === environment.apiUrl + '/Producto');
  });

  it('keeps typed text while invalidating a previously selected applicant', () => {
    vi.useFakeTimers();
    const component = fixture.componentInstance;
    component.facade.selectPerson({ idPersona: 1, nombreCompleto: 'Ana Pérez',
      cargo: { nombre: 'Analista' }, unidadOrganizativa: 'Compras' }, component.requestForm);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[placeholder="Solicitante"]') as HTMLInputElement;
    input.value = 'Mar'; input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input.value).toBe('Mar');
    expect(component.requestForm.controls.cargoSolicitante.value).toBe('');
    expect(component.facade.formSelections.solicitante()).toBeNull();
    vi.advanceTimersByTime(500);
    http.expectOne(environment.apiUrlIntranet + '/Persona/filter/Mar').flush({ status: true, data: [] });
  });

  it('sends Guardar to create_solicitud once, without list or pagination parameters', () => {
    const component = fixture.componentInstance;
    component.requestForm.patchValue({ idRecinto: 1, idTipoArticulo: 2, idTipoSolicitud: 3 });
    component.facade.selectPerson({ nombreCompleto: 'Ana Pérez', cargo: { nombre: 'Analista' },
      unidadOrganizativa: 'Compras' }, component.requestForm);
    component.facade.selectProduct({ idProducto: 1, nombre: 'Papel', stock: 2 }, component.requestDetailForm);
    component.requestDetailForm.patchValue({ cantidadSolicitada: 4 });
    component.facade.addDetail(component.requestDetailForm);
    fixture.detectChanges();
    const forms = fixture.nativeElement.querySelectorAll('form');
    forms[forms.length - 1].querySelector('button[type="submit"]').click();
    const req = http.expectOne(environment.apiUrl + '/Solicitudes/create_solicitud');
    expect(req.request.method).toBe('POST');
    expect(req.request.params.keys()).toEqual([]);
    expect(req.request.body).toMatchObject({ idRecinto: 1, solicitante: 'Ana Pérez',
      detalles: [{ idProducto: 1, cantidadSolicitada: 4 }] });
    expect(req.request.body).not.toHaveProperty('CantItems');
    expect(req.request.body).not.toHaveProperty('cantItems');
    req.flush({ success: true });
    http.expectNone(request => request.url === environment.apiUrl + '/Solicitudes');
    expect(alert.success).toHaveBeenCalled();
  });
});
