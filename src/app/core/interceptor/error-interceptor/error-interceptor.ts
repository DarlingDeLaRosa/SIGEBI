import { HttpInterceptorFn } from '@angular/common/http';

export const errorItcInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
