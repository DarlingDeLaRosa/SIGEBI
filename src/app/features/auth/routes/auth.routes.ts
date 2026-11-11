import { Routes } from '@angular/router';

const loadLogIn = () => import('../screen/log-in/log-in').then(m => m.LogIn);

export const AuthRoutes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: loadLogIn },
  { path: ':token', loadComponent: loadLogIn },
];
