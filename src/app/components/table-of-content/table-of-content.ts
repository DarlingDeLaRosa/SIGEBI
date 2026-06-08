import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { MaterialModules } from '../../shared/material';
import { tableColumnsInterface } from '../../interfaces/table-content-interface';
import { Loading } from '../../core/service/loading-service/loading';

@Component({
  selector: 'app-table-of-content',
  imports: [...MaterialModules, CommonModule],
  templateUrl: './table-of-content.html',
  styleUrl: './table-of-content.css',
})
export class TableOfContent {
  private loadingService = inject(Loading);
  loading = this.loadingService.loading;

  tableData = input<any[]>([]);
  showDetail = input<boolean>(false);
  showPagination = input<boolean>(false);
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
      start = Math.max( end - maxVisible + 1, 1 );
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  });

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
}
