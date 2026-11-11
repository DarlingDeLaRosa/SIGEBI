import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_EXCHANGE_URL } from '../../auth-service';
import { clearSession, readSessionToken } from '../../auth-session';
import { AuthRoutes } from '../../routes/auth.routes';
import { sessionGuard } from '../../session-guard';
import { LogIn } from './log-in';

@Component({ template: 'Inicio' })
class TestHome {}

describe('Acceso desde Intranet', () => {
  beforeEach(() => {
    clearSession();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'auth', children: AuthRoutes },
          { path: 'layout', canActivateChild: [sessionGuard], children: [{ path: 'inicio', component: TestHome }] },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    clearSession();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each([
    ['/auth/origen?token=ignorado', 'origen'],
    ['/auth?token=consulta', 'consulta'],
  ])('intercambia el token de %s, limpia la URL y abre Inicio', async (url, intranetToken) => {
    const harness = await RouterTestingHarness.create(url);
    expect(TestBed.inject(Location).path()).toBe('/auth');
    expect(harness.routeNativeElement?.textContent).toContain('Validando tu acceso');

    const request = TestBed.inject(HttpTestingController).expectOne(AUTH_EXCHANGE_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: intranetToken, idSistema: 27 });
    const token = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 60 })) + '.signature';
    const user = { idUsuario: 4, nombre: 'Ana', apellidos: 'Pérez', rol: { nombre: 'Consulta' } };
    request.flush({ success: true, token, data: user });
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/layout/inicio');
    expect(readSessionToken('userToken')).toBe(token);
    expect(readSessionToken('tokenIntranet')).toBe(intranetToken);
    expect(JSON.parse(sessionStorage.getItem('userSystem')!)).toEqual(user);
    expect(JSON.parse(sessionStorage.getItem('userRol')!)).toEqual(user.rol);
  });

  it.each(['rechazo', 'red', 'incompleta'] as const)('muestra el error de %s y vuelve a Intranet', async reason => {
    const redirect = vi.spyOn(LogIn.prototype, 'returnToIntranet').mockImplementation(() => {});
    const harness = await RouterTestingHarness.create('/auth/origen');
    const request = TestBed.inject(HttpTestingController).expectOne(AUTH_EXCHANGE_URL);
    vi.useFakeTimers();
    if (reason === 'rechazo') request.flush({ success: false });
    if (reason === 'red') request.error(new ProgressEvent('error'));
    if (reason === 'incompleta') request.flush({ success: true, data: {}, token: 'inválido' });
    harness.detectChanges();
    const expected = { rechazo: 'denegó', red: 'conectar', incompleta: 'incompleta' };
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain(expected[reason]);
    expect(harness.routeNativeElement?.querySelector('a')?.href).toBe('https://intranet.isfodosu.edu.do/');
    expect(readSessionToken('userToken')).toBeNull();
    await vi.advanceTimersByTimeAsync(4000);
    expect(redirect).toHaveBeenCalledOnce();
  });

  it.each([true, false])('protege Inicio según la vigencia de la sesión (%s)', async active => {
    const token = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + (active ? 60 : -60) })) + '.signature';
    sessionStorage.setItem('userToken', JSON.stringify(token));
    const harness = await RouterTestingHarness.create('/layout/inicio');
    expect(TestBed.inject(Router).url).toBe(active ? '/layout/inicio' : '/auth');
    expect(harness.routeNativeElement?.textContent).toContain(active ? 'Inicio' : 'Abre SIGEBI desde Intranet');
  });
});
