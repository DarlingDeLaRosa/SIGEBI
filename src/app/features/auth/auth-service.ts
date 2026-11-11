import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SIGEBI_SYSTEM_ID } from '../../shared/constant/system';
import { AuthUser } from './auth-session';

export const AUTH_EXCHANGE_URL = `${environment.apiUrlIntranet}/User/post/login`;

interface AuthResponse {
  success: boolean;
  message: string | null;
  token: string | null;
  data: AuthUser | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  exchange(token: string) {
    return this.http.post<AuthResponse>(AUTH_EXCHANGE_URL, { token, idSistema: SIGEBI_SYSTEM_ID });
  }
}
