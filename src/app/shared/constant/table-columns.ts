import { tableColumnsInterface } from "../../interfaces/table-content-interface"

export const NameColumns: tableColumnsInterface[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const EntryColumns: tableColumnsInterface[]= [
    { key: 'fechaCreacion', label: 'Fecha de creación', format: 'date' },
    { key: 'fechaFactura', label: 'Fecha de factura', format: 'date' },
    { key: 'noFactura', label: 'No. Factura',  },
    { key: 'proveedor.razonSocial', label: 'Proveedor' },
    { key: 'tipoEntrada.nombre', label: 'Tipo de entrada', align: 'center' },
    { key: 'tipoEntrega.nombre', label: 'Tipo de entrega', align: 'center' },
    { key: 'total', label: 'Total', format: 'currency', align: 'center' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const EntryDetailsColumns: tableColumnsInterface[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'idTipoAlmcacen.nombre', label: 'Almacén' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'condicion.value', label: 'Condición' },
    { key: 'serial', label: 'Serial' },
    { key: 'precio', label: 'Precio', format: 'currency' },
    { key: 'subTotal', label: 'SubTotal', format: 'currency' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const OutputColumns : tableColumnsInterface[] = [
    { key: 'codInstitucional', label: 'Código Institucional' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const RequestList: tableColumnsInterface[] = [
    { key: 'noRequerimiento', label: 'Número de Requerimiento' },
    { key: 'tipoArtiucloObj.nombre', label: 'Tipo de Artículo' },
    { key: 'tipoSolicitudObj.nombre', label: 'Tipo de Solicitud' },
    { key: 'solicitante', label: 'Unidad Responsable' },
    { key: 'fecha', label: 'Fecha de Creación' },
    { key: 'estadoObj.nombre', label: 'Estado' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const PurchaseContractList: tableColumnsInterface[] = [
    { key: 'noExpediente', label: 'Número de Expediente' },
    { key: 'noOrden', label: 'Número de Orden' },
    { key: 'modalidadCompra', label: 'Modalidad de Compra' },
    { key: 'formaPago', label: 'Forma de Pago', render: 'app-payment-badge', align: 'center', format: 'titlecase' },
    { key: 'proveedorObj.razonSocial', label: 'Proveedor', format: 'titlecase' },
    { key: 'total', label: 'Total', format: 'currency', align: 'center' },
    { key: 'estado', label: 'Estado', render: 'app-badge', align: 'center' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const PurchaseContractListSummary: tableColumnsInterface[] = [
    { key: 'noExpediente', label: 'Número de Expediente' },
    { key: 'noOrden', label: 'Número de Orden' },
    { key: 'modalidadCompra', label: 'Modalidad de Compra' },
    { key: 'estado', label: 'Estado', render: 'app-badge', align: 'center' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const PurchaseContractDetailsColumns: tableColumnsInterface[] = [
    { key: 'codInstitucional', label: 'Código Institucional' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const PurchaseContractColumns: tableColumnsInterface[] = [
    { key: 'codInstitucional', label: 'Código Institucional' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaCreacion', label: 'Fecha de creación' },
    { key: 'precio', label: 'Precio' },
    { key: 'stock', label: 'Existencia' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const PurchaseContractProductsColumnsSummary: tableColumnsInterface[] = [
    { key: 'descripcion', label: 'Nombre' },
    { key: 'calCantidad', label: 'Cantidad', format: 'number' },
    { key: 'precioUnitario', label: 'Precio', format: 'currency' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const PurchaseContractProductsColumns: tableColumnsInterface[] = [
    { key: 'descripcion', label: 'Nombre' },
    { key: 'cantidad', label: 'Cantidad', format: 'number' },
    { key: 'itbismoneda', label: 'ITBIS %', format: 'number' },
    { key: 'precioUnitario', label: 'Precio', format: 'currency' },
    { key: 'descuento', label: 'Descuento', format: 'currency' },
    { key: 'subtotal', label: 'Subtotal', format: 'currency' },
    { key: 'totalItbis', label: 'ITBIS', format: 'currency' },
    { key: 'total', label: 'Total', format: 'currency' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const ProductsColumns: tableColumnsInterface[] = [
    { key: 'codInstitucional', label: 'Código Institucional' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaCreacion', label: 'Fecha de creación', format: 'date', align: 'center' },
    { key: 'precio', label: 'Precio', format: 'currency', align: 'center' },
    { key: 'stock', label: 'Existencia', format: 'number', align: 'center' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const CatalogColumns: tableColumnsInterface[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'id', label: 'Código de producto' },
    { key: 'auxiliar.id', label: 'Cuenta presupuestaria' },
    { key: 'auxiliar.denominacion', label: 'Denominación' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
    // { key: 'sinonimos', label: 'Sinonimos' },
    // { key: 'definicionProducto', label: 'Definición Producto' },
]

export const SupplierColumns: tableColumnsInterface[] = [
    { key: 'rnc', label: 'RNC' },
    { key: 'nombreComercial', label: 'Nombre comercial' },
    { key: 'razonSocial', label: 'Razón social' },
    { key: 'representante', label: 'Representante' },
    { key: 'telRepresentante', label: 'Tel. representante' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const NameDescriptionColumns: tableColumnsInterface[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]

export const DescriptionColumns: tableColumnsInterface[] = [
    { key: 'descripcion', label: 'Nombre' },
    { key: 'acciones', label: 'Acciones', align: 'center' }
]