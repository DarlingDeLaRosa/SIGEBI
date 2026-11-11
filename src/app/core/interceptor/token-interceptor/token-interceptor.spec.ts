import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { AUTH_EXCHANGE_URL } from '../../../features/auth/auth-service';
import { clearSession } from '../../../features/auth/auth-session';
import { tokenInterceptor } from './token-interceptor';

describe('tokenInterceptor', () => {
  beforeEach(() => {
    clearSession();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([tokenInterceptor])), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    clearSession();
  });

  it('envía el token de cada API y excluye el intercambio y otros destinos', () => {
    const system = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 60 })) + '.signature';
    sessionStorage.setItem('userToken', JSON.stringify(system));
    sessionStorage.setItem('tokenIntranet', JSON.stringify('intranet'));
    const client = TestBed.inject(HttpClient);
    const http = TestBed.inject(HttpTestingController);

    for (const [url, expected] of [
      [environment.apiUrl + '/Solicitudes', system],
      [environment.apiUrlIntranet + '/GenericService/getallrecintos', 'intranet'],
      [AUTH_EXCHANGE_URL, null],
      ['https://example.com/api', null],
    ] as const) {
      client.get(url).subscribe();
      const request = http.expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe(expected);
      request.flush({});
    }
  });
});
