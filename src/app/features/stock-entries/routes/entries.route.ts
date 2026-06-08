import { Routes } from '@angular/router';

export const EntriesRoutes: Routes = [
    {
        path: '',
        redirectTo: 'Entradas',
        pathMatch: 'full'
    },
    {
        path: 'Entradas',
        loadComponent: () => import('../screens/entries/entries').then(m => m.Entries),
    },
    {
        path: 'gestionar-Entradas',
        loadComponent: () => import('../screens/stock-entry-form/stock-entry-form').then(m => m.StockEntryForm),
    }
]