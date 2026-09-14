import { ReportCardData } from '../../../shared/components/report-card/report-card.model';

export const INVENTORY_REPORTS: readonly ReportCardData[] = [
  {
    id: 'warehouse-balances',
    title: 'Existencias en almacenes',
    category: 'Disponibilidad',
    icon: 'bi-boxes',
    tone: 'blue',
    description:
      'Balance de las cantidades disponibles en cada almacén para conocer las existencias de insumos y artículos.',
    highlights: ['Cantidades por producto y almacén', 'Detalle por Rectoría o recinto'],
    note: 'Consulta a una fecha de corte o en un rango de fechas.',
  },
  {
    id: 'physical-inventory',
    title: 'Tomas físicas de inventario',
    category: 'Conteo físico',
    icon: 'bi-clipboard2-check',
    tone: 'green',
    description:
      'Levantamientos físicos de inventario para los controles mensuales y los requerimientos específicos de cada dependencia.',
    highlights: ['Levantamientos mensuales o específicos', 'Cantidades contadas físicamente'],
    note: 'Consulta por fecha de corte o período del levantamiento.',
  },
  {
    id: 'inventory-reconciliation',
    title: 'Conciliación de inventario',
    category: 'Control',
    icon: 'bi-arrow-left-right',
    tone: 'purple',
    description:
      'Comparación de la toma física real con el inventario perpetuo del sistema para identificar las diferencias.',
    highlights: [
      'Conteo físico frente al registro del sistema',
      'Diferencias entre ambas cantidades',
    ],
    note: 'Compara la información al corte o durante el período seleccionado.',
  },
  {
    id: 'inventory-valuation',
    title: 'Inventario costeado',
    category: 'Valoración',
    icon: 'bi-cash-stack',
    tone: 'amber',
    description:
      'Valor monetario de las existencias en pesos dominicanos, calculado mediante PEPS: Primero en Entrar, Primero en Salir.',
    highlights: ['Valoración de existencias en RD$', 'Método de costeo PEPS'],
    note: 'Presentación del valor a una fecha de corte o en un período.',
  },
  {
    id: 'stock-movements',
    title: 'Entradas, salidas y transferencias',
    category: 'Movimientos',
    icon: 'bi-truck',
    tone: 'blue',
    description:
      'Detalle de las entradas y salidas, incluyendo las transferencias recibidas y realizadas entre dependencias.',
    highlights: ['Entradas y salidas de almacén', 'Transferencias recibidas y realizadas'],
    note: 'Incluye la fecha de recepción física del insumo.',
  },
  {
    id: 'product-history',
    title: 'Movimiento por producto',
    category: 'Trazabilidad',
    icon: 'bi-clock-history',
    tone: 'green',
    description:
      'Historial de las transacciones de un artículo para dar seguimiento a sus movimientos durante el período consultado.',
    highlights: ['Historial individual por artículo', 'Transacciones ordenadas por fecha'],
    note: 'Consulta al corte o dentro de un rango de fechas.',
  },
  {
    id: 'purchase-contracts',
    title: 'Órdenes de compras y contratos',
    category: 'Abastecimiento',
    icon: 'bi-file-earmark-text',
    tone: 'purple',
    description:
      'Seguimiento de los pedidos para consultar las cantidades recibidas y las que todavía están pendientes de entrega.',
    highlights: ['Cantidades recibidas por pedido', 'Cantidades pendientes por recibir'],
    note: 'Las recepciones se presentan con su fecha física de entrega.',
  },
];

export const OFFICIAL_FORMS: readonly ReportCardData[] = [
  {
    id: 'entry-form',
    title: 'Formulario oficial de entrada',
    category: 'Formulario oficial',
    icon: 'bi-box-arrow-in-down',
    tone: 'green',
    printable: true,
    description:
      'Documento de recepción de insumos en almacén, preparado para su consulta, descarga e impresión.',
    highlights: ['Registro de la entrada de insumos', 'Fecha real de recepción física'],
    note: 'Disponible para emisión e impresión desde Reportes.',
  },
  {
    id: 'output-form',
    title: 'Formulario oficial de salida',
    category: 'Formulario oficial',
    icon: 'bi-box-arrow-up',
    tone: 'blue',
    printable: true,
    description:
      'Documento de despacho de insumos desde almacén, preparado para su consulta, descarga e impresión.',
    highlights: ['Registro de la salida de insumos', 'Documento para respaldo del despacho'],
    note: 'Disponible para emisión e impresión desde Reportes.',
  },
];
