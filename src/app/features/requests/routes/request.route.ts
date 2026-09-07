import { Routes } from '@angular/router';

export const RequestRoutes: Routes = [
    {
        path: '',
        redirectTo: 'Solicitud',
        pathMatch: 'full'
    },

    {
        path: 'Solicitud',
        loadComponent: () => import('../screens/requests/requests').then(m => m.Requests)
    },

    {
        path: 'gestionar-solicitudes',
        loadComponent: () => import('../screens/request-form/request-form') .then(m => m.RequestForm)
    }

]