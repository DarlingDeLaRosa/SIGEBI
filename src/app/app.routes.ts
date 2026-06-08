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
        //     {
        //         path: 'salidas',
        //         // loadChildren: () => import('./features/news/routes/news.routes').then(m => m.newsRoutes),
        //     },
        //     {
        //         path: 'consiliaciones',
        //         // loadChildren: () => import('./features/news/routes/news.routes').then(m => m.newsRoutes),
        //     },
            {
                path: 'productos',
                loadChildren: () => import('./features/products/routes/product.route').then(m => m.ProductRoutes),
            },
        //     {
        //         path: 'solicitudes',
        //         // loadChildren: () => import('./features/news/routes/news.routes').then(m => m.newsRoutes),
        //     },
        //     {
        //         path: 'reportes',
        //         // loadChildren: () => import('./features/news/routes/news.routes').then(m => m.newsRoutes),
        //     },
            {
                path: 'mantenimientos',
                loadChildren: () => import('./features/maintenance/routes/maintenance.route').then(m => m.MaintenanceRoutes),
            }
        ]
    }
];
