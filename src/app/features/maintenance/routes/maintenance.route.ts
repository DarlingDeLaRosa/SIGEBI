import { Routes } from '@angular/router';

export const MaintenanceRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('../screens/maintenance-layout/maintenance-layout').then(m => m.MaintenanceLayout),
        children: [
            {
                path: '',
                redirectTo: 'catalogo',
                pathMatch: 'full'
            },
            {
                path: 'catalogo',
                loadComponent: () => import('../screens/catalog/catalog').then(m => m.Catalog),
            },
            {
                path: 'nombre-almacen',
                loadComponent: () => import('../screens/warehouse-names/warehouse-names').then(m => m.WarehouseNames),
            },
            {
                path: 'tipo-entrada',
                loadComponent: () => import('../screens/stock-entry-type/stock-entry-type').then(m => m.StockEntryType),
            },
            {
                path: 'tipo-entrega',
                loadComponent: () => import('../screens/delivery-type/delivery-type').then(m => m.DeliveryType),
            },
            {
                path: 'unidad-medida',
                loadComponent: () => import('../screens/units-of-measure/units-of-measure').then(m => m.UnitsOfMeasure),
            },
            {
                path: 'tipo-salida',
                loadComponent: () => import('../screens/stock-output-type/stock-output-type').then(m => m.StockOutputType),
            },
            {
                path: 'tipos-productos',
                loadComponent: () => import('../screens/product-type/product-type').then(m => m.ProductType),
            },
            {
                path: 'usuarios',
                loadComponent: () => import('../screens/users/users').then(m => m.Users),
            },
            {
                path: 'proveedores',
                loadComponent: () => import('../screens/suppliers/suppliers').then(m => m.Suppliers),
            }
        ]
    }
]