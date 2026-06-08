import { Routes } from '@angular/router';

export const PurchasesContractRoutes: Routes = [
    {
        path: '',
        redirectTo: 'ordenes-de-compra',
        pathMatch: 'full'
    },
    {
        path: 'ordenes-de-compra',
        loadComponent: () => import('../screens/purchase-contract/purchase-contract').then(m => m.PurchaseContract)
    },
    {
        path: 'gestionar-ordenes-de-compra',
        loadComponent: () => import('../screens/purchase-contract-form/purchase-contract-form').then(m => m.PurchaseContractForm)
    }
]