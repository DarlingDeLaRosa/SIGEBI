import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { MaterialModules } from '../../material';
import { TableAction, tableColumnsInterface } from '../../../interfaces/table-content-interface';
import { Loading } from '../../../core/service/loading-service/loading';

@Component({
  selector: 'app-table-of-content',
  imports: [...MaterialModules, CommonModule],
  templateUrl: './table-of-content.html',
  providers: [CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe, UpperCasePipe, LowerCasePipe],
  styleUrl: './table-of-content.css',
})
export class TableOfContent {


  private titleCasePipe = inject(TitleCasePipe);
  private upperCasePipe = inject(UpperCasePipe);
  private lowerCasePipe = inject(LowerCasePipe);
  private currencyPipe = inject(CurrencyPipe);
  private datePipe = inject(DatePipe);
  private decimalPipe = inject(DecimalPipe);
  private loadingService = inject(Loading);
  loading = this.loadingService.loading;

  selectedRowId = input<number | undefined>();
  actions = input<TableAction[]>([]);
  showbasicActions = input<boolean>(true);
  tableData = input<any[]>([]);
  showDetail = input<boolean>(false);
  showPagination = input<boolean>(false);
  showTotal = input<boolean>(true);
  showContent = input<boolean>(false);
  tableTitle = input<string>('');
  trackByField = input<string>('id');
  tableColumns = input<tableColumnsInterface[]>([]);
  totalPages = input<number>(1);
  currentPage = input<number>(1);
  pageSize = input<number>(10);
  totalItems = input<number>(0);

  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() showDialog = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pages = computed(() => {
    const maxVisible = 5;
    const total = this.totalPages();
    const current = this.currentPage();

    let start = Math.max(
      current - Math.floor(maxVisible / 2),
      1
    );

    let end = start + maxVisible - 1;

    if (end > total) {
      end = total;
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  });

  isSelected(row: any): boolean {
    return row[this.trackByField()] === this.selectedRowId();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageChange.emit(page);
  }

  changePageSize(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }

  getValue(row: any, key: string | string[]): any {
    if (Array.isArray(key)) {
      return key
        .map(k => this.getNestedValue(row, k))
        .join(' ');
    }
    return this.getNestedValue(row, key);
  }

  private getNestedValue(obj: any, path: string): any {
    return path
      .split('.')
      .reduce((current, key) => current?.[key], obj);
  }

  formatValue(row: any, col: any): any {

    let value = this.getValue(row, col.key);

    if ((col.format === 'currency' || col.format === 'number') && value == null) {
      value = 0;
    }

    switch (col.format) {

      case 'currency':

        return this.currencyPipe.transform(
          value,
          'DOP ',
          'symbol',
          '1.2-2'
        );

      case 'date':
        return this.datePipe.transform(
          value,
          'dd/MM/yyyy'
        );

      case 'number':
        return this.decimalPipe.transform(
          value,
          '1.0-0'
        );

      case 'titlecase':
        return this.titleCasePipe.transform(value);

      case 'uppercase':
        return this.upperCasePipe.transform(value);

      case 'lowercase':
        return this.lowerCasePipe.transform(value);

      default:
        return value;
    }
  }

  isBadge(col: tableColumnsInterface): boolean {
    return col.render === 'app-badge';
  }

  getBadgeClass(value: string): string {

    switch ((value ?? '').trim().toLowerCase()) {

      case 'pendiente':
        return 'app-badge app-badge-warning';

      case 'aprobado':
        return 'app-badge app-badge-success';

      case 'recibida':
        return 'app-badge app-badge-info';

      case 'rechazado':
        return 'app-badge app-badge-danger';

      case 'cancelado':
        return 'app-badge app-badge-secondary';

      case 'en proceso':
        return 'app-badge app-badge-primary';

      default:
        return 'app-badge';
    }
  }

  isPaymentBadge(col: tableColumnsInterface): boolean {
    return col.render === 'app-payment-badge';
  }

  getPaymentClass(value: string): string {

    switch ((value ?? '').trim().toLowerCase()) {

      case 'efectivo':
      case 'contado':
        return 'payment-badge payment-success';

      case 'crédito':
      case 'credito':
        return 'payment-badge payment-primary';

      case 'cheque':
        return 'payment-badge payment-warning';

      case 'transferencia':
      case 'transferencia bancaria':
        return 'payment-badge payment-info';

      case 'tarjeta':
        return 'payment-badge payment-purple';

      default:
        return 'payment-badge';
    }

  }

  getPaymentIcon(value: string): string {

    switch ((value ?? '').trim().toLowerCase()) {

      case 'efectivo':
      case 'contado':
        return 'bi bi-cash-stack';

      case 'crédito':
      case 'credito':
        return 'bi bi-credit-card';

      case 'cheque':
        return 'bi bi-receipt';

      case 'transferencia':
      case 'transferencia bancaria':
        return 'bi bi-bank';

      case 'tarjeta':
        return 'bi bi-credit-card-2-front';

      default:
        return 'bi bi-wallet2';
    }

  }

  getAlignment(col: tableColumnsInterface): string {

    switch (col.align) {

      case 'center':
        return 'justify-center';

      case 'right':
        return 'justify-end';

      default:
        return 'justify-start';
    }

  }
}
