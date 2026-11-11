import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { isCurrentSystemToken, readSessionToken } from './auth-session';

export const sessionGuard: CanActivateChildFn = () =>
  isCurrentSystemToken(readSessionToken('userToken')) || inject(Router).createUrlTree(['/auth']);
