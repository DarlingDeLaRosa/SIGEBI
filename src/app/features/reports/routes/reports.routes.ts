import { Routes } from '@angular/router';

export const ReportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../screens/reports/reports').then((module) => module.Reports),
  },
];
