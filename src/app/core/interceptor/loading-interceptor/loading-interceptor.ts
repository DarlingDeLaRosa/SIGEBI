import { HttpInterceptorFn } from '@angular/common/http';
import { Loading } from '../../service/loading-service/loading';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(Loading);

  loadingService.start();

  return next(req).pipe(
    finalize(() => loadingService.stop())
  );
};
