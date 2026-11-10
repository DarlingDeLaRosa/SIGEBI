import { Routes } from '@angular/router';

export const HomeRoutes: Routes = [
  {
    path: '',
    redirectTo: 'Home',
    pathMatch: 'full',
  },

  {
    path: 'Home',
    loadComponent: () =>
      import('../screens/home/home').then(
        (m) => m.Home,
      ),
  },
  
];
