import { Routes } from '@angular/router';

export const ProductRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('../screens/product/product').then(m => m.Product),
    }
]