import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Users } from './users';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { Alert } from '../../../../core/service/alert-service/alert';
import { environment } from '../../../../../environments/environment';
import { SystemUser } from '../../DTO/users';

const api = environment.apiUrlIntranet;
const person = { idPersona: 7, idUsuario: 200, nombre: 'Ana', apellidos: 'Pérez', nombreCompleto: 'Ana Pérez' };
const role = { idRol: 4, idSistema: 27, nombre: 'Consulta' };
const user: SystemUser = { idUsuario: 200, usuario: 'ana', idPersona: 7, persona: person,
  idRol: 4, rol: role, recinto: { nombre: 'Recinto' }, rowKey: '200-4' };

describe('Users', () => {
  let fixture: ComponentFixture<Users>;
  let component: Users;
  let http: HttpTestingController;
  const alert = { error: vi.fn(), success: vi.fn(), confirmDelete: vi.fn() };

  function flushList(data: SystemUser[] = [], page = 1, pages = 1, total = data.length) {
    const req = http.expectOne(request => request.url === `${api}/User/getusuariossistema/27`);
    req.flush({ status: true, data, currentPage: page, totalPage: pages, totalItem: total });
    return req;
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    await TestBed.configureTestingModule({ imports: [Users], providers: [
      provideHttpClient(), provideHttpClientTesting(), { provide: Alert, useValue: alert },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushList();
    http.expectOne(`${api}/Rol/getrolesbyidsistema/27`).flush({ status: true, data: [role] });
    fixture.detectChanges();
  });
  afterEach(() => { vi.useRealTimers(); http.verify(); });

  it('loads the initial data and keeps generic actions visible and inert', () => {
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    expect(table.showbasicActions()).toBe(true);
    expect(table.showPagination()).toBe(true);
    expect(table.actions().map(action => action.label)).toContain('Remover persona del sistema');
    table.edit.emit({ row: user, index: 0 });
    table.remove.emit({ row: user, index: 0 });
    expect(alert.confirmDelete).not.toHaveBeenCalled();
    http.expectNone(request => request.method !== 'GET');
  });

  it('keeps the filter when navigating and resets the page on size changes', () => {
    component.search.set('Ana');
    component.changePage(2);
    let req = flushList([user], 2, 2, 11);
    expect(req.request.params.get('filter')).toBe('Ana');
    expect(req.request.params.get('currentPage')).toBe('2');
    component.changePageSize(5);
    req = flushList([user], 1, 3, 11);
    expect(req.request.params.get('currentPage')).toBe('1');
    expect(req.request.params.get('totalItem')).toBe('5');
  });

  it('debounces person searches and selects the returned user without another request', () => {
    vi.useFakeTimers();
    const input = fixture.nativeElement.querySelector('input[placeholder="Persona"]') as HTMLInputElement;
    input.value = 'An'; input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    input.value = 'Ana'; input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(499);
    http.expectNone(request => request.url === `${api}/User/getusuariossistema/1`);
    vi.advanceTimersByTime(1);
    const searchRequest = http.expectOne(request => request.url === api + '/User/getusuariossistema/1');
    expect(searchRequest.request.params.get('filter')).toBe('Ana');
    expect(searchRequest.request.params.get('currentPage')).toBe('1');
    expect(searchRequest.request.params.get('totalItem')).toBe('10');
    searchRequest.flush({ status: true, data: [user] });
    fixture.detectChanges();
    const selector = fixture.debugElement.query(By.directive(SearchSelect)).componentInstance as SearchSelect;
    selector.selectItem(component.people()[0]);
    http.expectNone(() => true);
    expect(component.userForm.controls.idUsuario.value).toBe(200);
  });

  it('rejects a missing or invalid user ID locally without substituting the person ID', () => {
    for (const idUsuario of [undefined, null, 0, -1, 1.5, NaN]) {
      component.selectPerson({ ...person, idUsuario });
      expect(component.userForm.controls.idUsuario.value).toBe(0);
      expect(component.userForm.invalid).toBe(true);
      expect(component.selectedPerson()).toBeNull();
    }
    expect(alert.error).toHaveBeenCalledTimes(6);
    http.expectNone(() => true);
  });

  it('accepts a user ID without a cedula and clears it when the search changes', () => {
    component.selectPerson(person);
    component.selectRole(role);
    expect(component.userForm.valid).toBe(true);
    expect(component.userForm.controls.idUsuario.value).toBe(200);
    component.personSearchChanged();
    expect(component.selectedPerson()).toBeNull();
    expect(component.userForm.controls.idUsuario.value).toBe(0);
    expect(component.userForm.controls.idRol.value).toBe(4);
    http.expectNone(() => true);
  });

  it('clears the selected person and role when the form is reset', () => {
    component.selectPerson(person);
    component.selectRole(role);
    component.clearForm();
    expect(component.selectedPerson()).toBeNull();
    expect(component.selectedRole()).toBeNull();
    expect(component.userForm.getRawValue()).toEqual({ idUsuario: 0, idRol: 0 });
    expect(component.userForm.pristine).toBe(true);
    http.expectNone(() => true);
  });

  it('still cancels pending person searches', () => {
    component.loadPeople('Ana');
    const req = http.expectOne(request => request.url === api + '/User/getusuariossistema/1');
    component.personSearchChanged();
    expect(req.cancelled).toBe(true);
  });

  it('disables saving when there are no roles', () => {
    component.loadRoles();
    http.expectOne(`${api}/Rol/getrolesbyidsistema/27`).flush({ status: true, data: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay roles disponibles');
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });

  it('posts the assignment, prevents double submission and clears only after success', () => {
    component.selectPerson(person);
    component.selectRole(role);
    component.save();
    component.save();
    const req = http.expectOne(`${api}/Sistema/add-user-system`);
    expect(req.request.body).toEqual({ idUsuario: 200, idRol: 4, idSistema: 27 });
    req.flush({ status: true });
    flushList([user]);
    expect(component.userForm.pristine).toBe(true);
    expect(component.selectedPerson()).toBeNull();
    expect(alert.success).toHaveBeenCalled();
  });

  it('retains selections when the backend rejects the assignment', () => {
    component.selectPerson(person);
    component.selectRole(role);
    component.save();
    http.expectOne(`${api}/Sistema/add-user-system`).flush({ status: false, message: 'Ya existe' });
    expect(component.selectedPerson()).toEqual(person);
    expect(component.saving()).toBe(false);
    expect(alert.error).toHaveBeenCalledWith('Ya existe');
  });

  it('does nothing when removal is cancelled', async () => {
    alert.confirmDelete.mockResolvedValue({ isConfirmed: false });
    await component.removeUser(user);
    http.expectNone(request => request.method === 'POST');
    expect(component.saving()).toBe(false);
  });

  it('removes the membership through its custom action and returns to the previous page', async () => {
    component.data.set({ data: [user], currentPage: 2, cantItem: 10, cantPage: 2, dateNow: '', message: '', success: true });
    component.pagination.update(state => ({ ...state, currentPage: 2 }));
    alert.confirmDelete.mockResolvedValue({ isConfirmed: true });
    component.actions[0].action({ row: user, index: 0 });
    await Promise.resolve();
    const req = http.expectOne(`${api}/Sistema/remove-user-system`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ idUsuario: 200, idRol: 4, idSistema: 27 });
    req.flush({ status: true });
    const list = flushList();
    expect(list.request.params.get('currentPage')).toBe('1');
    http.expectNone(request => request.method === 'DELETE');
  });
});
