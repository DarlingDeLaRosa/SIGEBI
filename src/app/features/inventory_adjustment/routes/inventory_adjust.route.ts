import { Routes } from '@angular/router';

export const InventoryAdjustRoutes: Routes = [
  {
    path: '',
    redirectTo: 'Ajuste-de-inventario',
    pathMatch: 'full',
  },

  {
    path: 'Ajuste-de-inventario',
    loadComponent: () =>
      import('../screens/inventory-adjustment/inventory-adjustment').then(
        (m) => m.InventoryAdjustment,
      ),
  },
  {
    path: 'gestionar-ajuste-de-inventario',
    loadComponent: () =>
      import('../screens/inventory-adjustment-form/inventory-adjustment-form').then(
        (m) => m.InventoryAdjustmentForm,
      ),
  },
  {
    path: 'gestionar-ajuste-de-inventario/:id',
    loadComponent: () =>
      import('../screens/inventory-adjustment-form/inventory-adjustment-form').then(
        (m) => m.InventoryAdjustmentForm,
      ),
  },
];
