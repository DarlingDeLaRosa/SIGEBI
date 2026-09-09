import { Routes } from '@angular/router';

export const TransferRoutes: Routes = [
  {
    path: '',
    redirectTo: 'Transferencias',
    pathMatch: 'full',
  },
  {
    path: 'Transferencias',
    loadComponent: () => import('../screens/transfers/transfers').then((m) => m.Transfers),
  },
  // {
  //     path: 'gestionar-Transferencias',
  //     loadComponent: () => import('../screens/outputs-form/outputs-form').then(m => m.OutputsForm),
  // }
];
