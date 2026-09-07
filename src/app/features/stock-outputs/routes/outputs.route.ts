import { Routes } from '@angular/router';

export const OutputsRoutes: Routes = [
    {
        path: '',
        redirectTo: 'Salidas',
        pathMatch: 'full'
    },
    {
        path: 'Salidas',
        loadComponent: () => import('../screens/outputs/outputs').then(m => m.Outputs),
    },
    {
        path: 'gestionar-Salidas',
        loadComponent: () => import('../screens/outputs-form/outputs-form').then(m => m.OutputsForm),
    }
]