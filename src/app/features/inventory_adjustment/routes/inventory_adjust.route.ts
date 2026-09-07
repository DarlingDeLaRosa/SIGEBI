import { Routes } from '@angular/router';

export const InventoryAdjustRoutes: Routes = [
    {
        path: '',
        redirectTo: 'Ajuste-de-inventario',
        pathMatch: 'full'
    },

    {
        path: 'Ajuste-de-inventario',
        loadComponent: () => import('../screens/inventory-adjustment/inventory-adjustment').then(m => m.InventoryAdjustment)
    },

]