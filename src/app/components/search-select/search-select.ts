import { Component, effect, ElementRef, EventEmitter, HostListener, inject, Input, input, OnInit, Output, output, signal, SimpleChanges } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, Observable, switchMap } from 'rxjs';
import { Loading } from '../../core/service/loading-service/loading';

@Component({
  selector: 'app-search-select',
  imports: [],
  templateUrl: './search-select.html',
  styleUrl: './search-select.css',
})
export class SearchSelect implements OnInit {

  private loadingService = inject(Loading);
  loading = this.loadingService.loading
  isSelecting = false;

  @Input() items: any[] = [];
  @Input() initialItems: any[] = [];
  @Input() displayField: string = '';
  @Input() showAll: boolean = false;
  @Input() placeholder: string = '';
  @Input() value: any = '';
  @Input() valueField: string = 'id';
  @Input() selectedItem: any = null;

  @Output() search = new EventEmitter<string>();
  @Output() selected = new EventEmitter<any>();

  searchText = signal('');
  dropdownOpen = signal(false);
  filteredItems = signal<any[]>([]);
  debounceTimer: any;

  constructor(
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    if (this.initialItems.length > 0) {
      this.filteredItems.set(this.initialItems);
    }
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchText.set(value);
    this.dropdownOpen.set(true);

    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.search.emit(value);
    }, 500);
  }

  selectItem(item: any = '') {
    this.isSelecting = true;

    this.searchText.set(item ? item[this.displayField] : 'Todos');
    this.selected.emit(item);
    this.dropdownOpen.set(false);

    setTimeout(() => { this.isSelecting = false;});
  }

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);

    if (this.dropdownOpen()) {
      this.filteredItems.set(
        this.items.length ? this.items : this.initialItems
      );
    }
  }

  clear() {
    this.searchText.set('');
    this.filteredItems.set([]);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // ACTUALIZAR ITEMS
    if (this.isSelecting) return;

    if (changes['items']) {

      this.filteredItems.set(this.items);

    }

    // LIMPIAR

    if (
      this.value === null ||
      this.value === undefined ||
      this.value === '' ||
      this.value === 0
    ) {

      this.searchText.set('');

      return;
    }

    // SI RECIBE OBJETO COMPLETO

    if (
      this.selectedItem &&
      this.selectedItem[this.displayField]
    ) {

      this.searchText.set(
        this.selectedItem[this.displayField]
      );

      return;
    }

    // FALLBACK POR ITEMS

    const localItem = this.items.find(
      x => x[this.valueField] == this.value
    );

    if (localItem) {

      this.searchText.set(
        localItem[this.displayField]
      );

      return;
    }

    this.searchText.set('');
  }
}
