import { Routes } from '@angular/router';
import { sessionGuard } from './features/auth/session-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'layout/inicio', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/routes/auth.routes').then(m => m.AuthRoutes)
    },
    {
        path: 'layout',
        canActivate: [sessionGuard],
        canActivateChild: [sessionGuard],
        loadComponent: () => import('./layout/layout').then(m => m.Layout),
        children: [
            { path: '', redirectTo: 'inicio', pathMatch: 'full' },
            {
                path: 'inicio',
                loadChildren: () => import('./features/dashboard/routes/dashboard.route').then(m => m.HomeRoutes),
            },
            {
                path: 'orden-de-compra',
                loadChildren: () => import('./features/purchases-contracts/routes/purchases-contract.routes').then(m => m.PurchasesContractRoutes),
            },
            {
                path: 'entradas',
                loadChildren: () => import('./features/stock-entries/routes/entries.route').then(m => m.EntriesRoutes),
            },
            {
                path: 'salidas',
                loadChildren: () => import('./features/stock-outputs/routes/outputs.route').then(m => m.OutputsRoutes),
            },
            {
                path: 'transferencia',
                loadChildren: () => import('./features/transfers/routes/tranfers.route').then(m => m.TransferRoutes),
            },
            {
                path: 'conciliaciones',
                loadChildren: () => import('./features/inventory_adjustment/routes/inventory_adjust.route').then(m => m.InventoryAdjustRoutes),
            },
            {
                path: 'productos',
                loadChildren: () => import('./features/products/routes/product.route').then(m => m.ProductRoutes),
            },
            {
                path: 'solicitudes',
                loadChildren: () => import('./features/requests/routes/request.route').then(m => m.RequestRoutes),
            },
            {
                path: 'reportes',
                loadChildren: () => import('./features/reports/routes/reports.routes').then(m => m.ReportsRoutes),
            },
            {
                path: 'mantenimientos',
                loadChildren: () => import('./features/maintenance/routes/maintenance.route').then(m => m.MaintenanceRoutes),
            }
        ]
    }
];
