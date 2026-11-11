import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AUTH_EXCHANGE_URL } from '../../../features/auth/auth-service';
import { isCurrentSystemToken, readSessionToken } from '../../../features/auth/auth-session';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url === AUTH_EXCHANGE_URL || req.headers.has('Authorization')) return next(req);

  if (req.url.startsWith(environment.apiUrlIntranet + '/')) {
    const token = readSessionToken('tokenIntranet');
    return next(token ? req.clone({ setHeaders: { Authorization: token } }) : req);
  }

  if (req.url.startsWith(environment.apiUrl + '/')) {
    const token = readSessionToken('userToken');
    return next(isCurrentSystemToken(token) ? req.clone({ setHeaders: { Authorization: token } }) : req);
  }

  return next(req);
};
