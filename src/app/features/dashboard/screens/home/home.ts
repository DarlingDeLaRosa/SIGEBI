import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { PURCHASE_STATUS } from '../../../../shared/constant/select-options';
import { HomeAdjustmentColumns, HomeEntryColumns, HomeOutputColumns, HomePurchaseColumns } from '../../../../shared/constant/table-columns';
import { IntranetService } from '../../../../shared/service/general.service';
import { InventoryAdjustmentMapper } from '../../../inventory_adjustment/mappers/inventory-adjustment-mapper';
import { InventoryAdjustmentService } from '../../../inventory_adjustment/services/inventory-adjustment-service';
import { PurchaseContractFacade } from '../../../purchases-contracts/facades/purchases-contract-facade';
import { PurchaseContractService } from '../../../purchases-contracts/services/purchase-contract-service';
import { RequestsService } from '../../../requests/services/requests-service';
import { StockEntryService } from '../../../stock-entries/services/stock-entry-service';
import { OutputService } from '../../../stock-outputs/services/output-service';
import { TransferService } from '../../../transfers/services/transfer-service';

type Preview =
  | { state: 'loading' | 'error' }
  | { state: 'ready'; rows: unknown[]; total: number | null };

interface DashboardQuery {
  result: WritableSignal<Preview>;
  query: () => Observable<{ success?: boolean; data?: unknown[] | null; totalItems?: number | null }>;
}

const PAGE = { page: 1, CantItems: 3 };

@Component({
  selector: 'app-home',
  imports: [RouterLink, TableOfContent],
  providers: [PurchaseContractFacade],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = inject(RequestsService);
  private readonly transfers = inject(TransferService);
  private readonly purchases = inject(PurchaseContractService);
  private readonly entries = inject(StockEntryService);
  private readonly outputs = inject(OutputService);
  private readonly adjustments = inject(InventoryAdjustmentService);
  private readonly intranet = inject(IntranetService);

  private readonly purchase = {
    link: '/layout/orden-de-compra',
    result: signal<Preview>({ state: 'loading' }),
    query: () => this.purchases.getAll({
      page: 1, cantItem: PAGE.CantItems, estado: PURCHASE_STATUS.find(status => status.name === 'Pendiente')!.value,
    }),
  };

  private readonly adjustment = {
    link: '/layout/conciliaciones',
    result: signal<Preview>({ state: 'loading' }),
    query: () => this.adjustments.searchAdjustments({
      idRecinto: null, idTipoAlmacen: null, numeroTomaFisica: null, idProducto: null,
    }, PAGE.page, PAGE.CantItems).pipe(
      switchMap(response => {
        const rows = (response.data ?? []).map(InventoryAdjustmentMapper.fromApi);
        if (!rows.some(row => row.campusId != null)) return of({ ...response, data: rows });
        return this.intranet.getAllRecinto().pipe(map(catalog => {
          if (catalog.success === false) throw new Error('Recintos no disponibles');
          return {
            ...response,
            data: rows.map(row => ({
              ...row,
              campusName: catalog.data?.find(campus => campus.idRecinto === row.campusId)?.nombre,
            })),
          };
        }));
      }),
    ),
  };

  readonly summaries = [
    {
      title: 'Solicitudes pendientes', icon: 'bi-clipboard-check', color: 'amber',
      link: '/layout/solicitudes',
      result: signal<Preview>({ state: 'loading' }),
      query: () => this.requests.getRequestStatuses().pipe(
        switchMap(response => {
          const status = response.data?.find(item => item.nombre.trim().toLowerCase() === 'pendiente');
          if (response.success === false || !status?.id) throw new Error('Estado pendiente no disponible');
          return this.requests.getAll({ ...PAGE, idEstadoSolicitud: status.id });
        }),
      ),
      present: 'Hay pendientes', empty: 'Sin pendientes',
    },
    {
      title: 'Transferencias pendientes', icon: 'bi-truck', color: 'blue',
      link: '/layout/transferencia',
      result: signal<Preview>({ state: 'loading' }),
      query: () => this.transfers.getAll({ ...PAGE, Estado: 'Pendiente' }),
      present: 'Hay pendientes', empty: 'Sin pendientes',
    },
    {
      ...this.purchase, title: 'Órdenes por recibir', icon: 'bi-cart-check', color: 'green',
      present: 'Hay pendientes', empty: 'Sin pendientes',
    },
    {
      ...this.adjustment, title: 'Conciliaciones', icon: 'bi-clipboard-data', color: 'violet',
      present: 'Hay conciliaciones', empty: 'Sin conciliaciones',
    },
  ];

  readonly tables = [
    {
      title: 'Entradas registradas', link: '/layout/entradas', trackBy: 'idEntrada',
      columns: HomeEntryColumns, actions: [], empty: 'Sin entradas',
      result: signal<Preview>({ state: 'loading' }),
      query: () => this.entries.getFiltersEntries({ page: PAGE.page, cantItems: PAGE.CantItems }),
    },
    {
      title: 'Salidas registradas', link: '/layout/salidas', trackBy: 'idSalida',
      columns: HomeOutputColumns, actions: [], empty: 'Sin salidas',
      result: signal<Preview>({ state: 'loading' }),
      query: () => this.outputs.getAll(PAGE),
    },
    {
      ...this.purchase, title: 'Órdenes de compra pendientes', trackBy: 'id',
      columns: HomePurchaseColumns, empty: 'Sin pendientes',
      actions: inject(PurchaseContractFacade).actions.filter(action => action.label === 'Crear entrada'),
    },
    {
      ...this.adjustment, title: 'Conciliaciones registradas', trackBy: 'id',
      columns: HomeAdjustmentColumns, actions: [], empty: 'Sin conciliaciones',
    },
  ];

  constructor() {
    for (const block of [...this.summaries, ...this.tables.slice(0, 2)]) this.load(block);
  }

  load(block: DashboardQuery): void {
    block.result.set({ state: 'loading' });
    block.query().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => block.result.set(response.success === false
        ? { state: 'error' }
        : { state: 'ready', rows: response.data?.slice(0, PAGE.CantItems) ?? [], total: response.totalItems ?? null }),
      error: () => block.result.set({ state: 'error' }),
    });
  }
}
