import { Routes } from '@angular/router';

export const routes: Routes = [
    //  {
    //     path: 'auth',
    //     loadComponent: () => import('./features/auth/screens/auth/auth').then(m => m.Auth)
    // },
    {
        path: 'layout',
        loadComponent: () => import('./layout/layout').then(m => m.Layout),
        children: [
        //     {
        //         path: 'inicio',
        //         // loadChildren: () => import('./features/news/routes/news.routes').then(m => m.newsRoutes),
        //     },
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
