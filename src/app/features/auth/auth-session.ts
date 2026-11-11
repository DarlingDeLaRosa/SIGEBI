import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  idUsuario: number | null;
  nombre: string | null;
  apellidos: string | null;
  rol: { nombre: string } | null;
}

export const INTRANET_URL = 'https://intranet.isfodosu.edu.do';

export function isCurrentSystemToken(token: string | null | undefined): token is string {
  if (!token || token.split('.').length !== 3) return false;
  try {
    const { exp } = jwtDecode(token);
    return typeof exp === 'number' && Number.isFinite(exp) && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function readSessionToken(key: 'userToken' | 'tokenIntranet'): string | null {
  try {
    const token: unknown = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    return typeof token === 'string' && token.trim() ? token : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  for (const key of ['userToken', 'tokenIntranet', 'userSystem', 'userRol']) {
    sessionStorage.removeItem(key);
  }
}

export function saveSession(token: string, intranetToken: string, user: AuthUser): void {
  sessionStorage.setItem('userSystem', JSON.stringify(user));
  sessionStorage.setItem('userRol', JSON.stringify(user.rol ?? null));
  sessionStorage.setItem('tokenIntranet', JSON.stringify(intranetToken));
  sessionStorage.setItem('userToken', JSON.stringify(token));
}
