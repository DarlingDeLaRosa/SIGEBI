import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryAdjustmentForm } from './inventory-adjustment-form';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { Alert } from '../../../../core/service/alert-service/alert';
import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { EntryDetails } from '../../../stock-entries/dialog/entry-details/entry-details';

const detail = { productId: 1, productName: 'Papel', countedQuantity: 0, inventoryQuantity: 10,
  observations: '', entryDetailId: 2, warehouseId: 3, warehouseName: 'Almacén', difference: -10 };

describe('InventoryAdjustmentForm', () => {
  let fixture: ComponentFixture<InventoryAdjustmentForm>;
  let http: HttpTestingController;
  const alert = { error: vi.fn(), success: vi.fn() };
  const dialog = { open: vi.fn() };
  const select = (placeholder: string) => fixture.debugElement.queryAll(By.directive(SearchSelect))
    .map(item => item.componentInstance as SearchSelect).find(item => item.placeholder === placeholder)!;

  beforeEach(async () => {
    alert.error.mockClear();
    dialog.open.mockClear();
    await TestBed.configureTestingModule({ imports: [InventoryAdjustmentForm], providers: [
      provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: Alert, useValue: alert },
      { provide: DialogService, useValue: dialog },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(InventoryAdjustmentForm);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrlIntranet}/GenericService/getallrecintos`)
      .flush({ success: true, data: [{ idRecinto: 1, nombre: 'Central' }, { idRecinto: 2, nombre: 'Norte' }] });
    http.match(() => true).forEach(req => req.flush({ success: true, data: [] }));
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  it('enables entry information after selection and reuses its loaded data without another request', () => {
    select('Recinto *').selected.emit({ idRecinto: 1, nombre: 'Central' });
    select('Almacén *').selected.emit({ idTipoAlm: 3, nombre: 'Almacén', idRecinto: 1 });
    fixture.detectChanges();
    const button = () => [...fixture.nativeElement.querySelectorAll('button')]
      .find((item: any) => item.textContent.includes('Ver información de la entrada')) as HTMLButtonElement;
    expect(button().disabled).toBe(true);
    select('Producto *').selected.emit({ idProducto: 1, nombre: 'Papel' });
    const entry = { idEntradaDet: 2, idEntrada: 4, producto: { idProducto: 1, nombre: 'Papel' },
      cantidad: 12, marca: 'Marca', modelo: 'Modelo', serial: 'ABC', precio: 100, subTotal: 1200 };
    http.expectOne(`${environment.apiUrl}/Entrada/by_idproducto_idtipoalmacen/1/3`).flush({ success: true, data: [entry] });
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#entry-detail') as HTMLSelectElement;
    input.value = input.options[1].value;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.facade.detailForm.controls.inventoryQuantity.value).toBe(12);
    expect(button().disabled).toBe(false);
    button().click();
    expect(dialog.open).toHaveBeenCalledWith(EntryDetails, { detail: entry, campusName: 'Central', warehouseName: 'Almacén' });
    http.expectNone(() => true);
    select('Producto *').searchChange.emit('Otro');
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
  });

  it('uses Persona/filter and displays the selected position as readonly', () => {
    select('Participante *').search.emit('Ana Pérez');
    const req = http.expectOne(`${environment.apiUrlIntranet}/Persona/filter/Ana%20P%C3%A9rez`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: true, data: [{ idPersona: 8, nombre: 'Ana', apellidos: 'Pérez', cargo: { nombre: 'Analista' } }] });
    select('Participante *').selected.emit(fixture.componentInstance.facade.people()[0]);
    fixture.detectChanges();
    const position = fixture.nativeElement.querySelector('#participant-position') as HTMLInputElement;
    expect(position.readOnly).toBe(true);
    expect(position.value).toBe('Analista');
    select('Participante *').searchChange.emit('Otra');
    fixture.detectChanges();
    expect(position.value).toBe('');
    http.expectNone(() => true);
  });

  it('locks campus and warehouse with existing details and shows the campus name', () => {
    select('Recinto *').selected.emit({ idRecinto: 1, nombre: 'Central' });
    expect(fixture.componentInstance.facade.form.controls.campusId.value).toBe(1);
    fixture.componentInstance.facade.details.set([detail]);
    fixture.detectChanges();
    expect(select('Recinto *')).toBeUndefined();
    expect(select('Almacén *')).toBeUndefined();
    const campus = fixture.nativeElement.querySelector('#count-campus') as HTMLInputElement;
    expect(campus.value).toBe('Central');
    expect(campus.readOnly).toBe(true);
  });

  it('cancels pending product and entry requests as soon as the search text changes', () => {
    const facade = fixture.componentInstance.facade;
    select('Recinto *').selected.emit({ idRecinto: 1, nombre: 'Central' });
    select('Almacén *').selected.emit({ idTipoAlm: 3, nombre: 'Almacén', idRecinto: 1 });
    fixture.detectChanges();
    select('Producto *').selected.emit({ idProducto: 1, nombre: 'Papel' });
    const entries = http.expectOne(`${environment.apiUrl}/Entrada/by_idproducto_idtipoalmacen/1/3`);
    select('Producto *').search.emit('Pap');
    const products = http.expectOne(req => req.url === `${environment.apiUrl}/Producto`);
    select('Producto *').searchChange.emit('Otro');
    expect(entries.cancelled).toBe(true);
    expect(products.cancelled).toBe(true);
    expect(facade.selectedProduct()).toBeNull();
    expect(facade.detailForm.controls.inventoryQuantity.value).toBeNull();
  });

  it('shows field validation, uses standard alerts and shared final save actions', () => {
    const component = fixture.componentInstance;
    component.facade.save();
    fixture.detectChanges();
    expect(alert.error).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Cargando conciliación');
    expect(fixture.nativeElement.textContent).toContain('Indica la hora de inicio');
    expect(fixture.nativeElement.textContent).toContain('Indica la hora de término');
    const actions = fixture.debugElement.queryAll(By.directive(FormActions)).map(item => item.componentInstance as FormActions);
    const save = actions.find(action => action.nameActionBoton() === 'Guardar conciliación')!;
    expect(save.disabled()).toBe(true);
    const participant = actions.find(action => action.nameActionBoton() === 'Agregar participante')!;
    expect(participant.editing()).toBe(false);
    component.facade.selectParticipant({ idPersona: 8, nombreCompleto: 'Ana Pérez', cargo: { nombre: 'Analista' } });
    fixture.detectChanges();
    expect(participant.editing()).toBe(true);
    component.facade.clearParticipant();
    fixture.detectChanges();
    expect(participant.editing()).toBe(false);
  });
});
