import { computed, DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TableAction } from '../../../interfaces/table-content-interface';
import { DialogService } from '../../../core/service/dialog-service/dialog';
import { Alert } from '../../../core/service/alert-service/alert';
import { ApiResponse } from '../../../shared/interface/abstracts-class';
import { IntranetService } from '../../../shared/service/general.service';
import { ProductTypeService } from '../../maintenance/services/productType/product-type-service';
import { RequestsService } from '../services/requests-service';
import { RequestDetail } from '../dialog/request-detail/request-detail';

interface NamedOption { id: number; nombre: string; }
interface CampusOption { idRecinto: number; nombre: string; }
interface ArticleOption { idTipoArt: number; nombre: string; }

@Injectable()
export class RequestFacade {
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private service = inject(RequestsService);
  private intranet = inject(IntranetService);
  private productTypes = inject(ProductTypeService);
  private alert = inject(Alert);
  private destroyRef = inject(DestroyRef);
  private articleRequest?: Subscription;

  status = signal<NamedOption[]>([]);
  requestTypes = signal<NamedOption[]>([]);
  campuses = signal<CampusOption[]>([]);
  articleTypes = signal<ArticleOption[]>([]);
  statusSearch = signal('');
  requestTypeSearch = signal('');
  campusSearch = signal('');
  filteredStatus = computed(() => this.filter(this.status(), this.statusSearch()));
  filteredRequestTypes = computed(() => this.filter(this.requestTypes(), this.requestTypeSearch()));
  filteredCampuses = computed(() => this.filter(this.campuses(), this.campusSearch()));
  filterSelections = {
    status: signal<NamedOption | null>(null),
    requestType: signal<NamedOption | null>(null),
    campus: signal<CampusOption | null>(null),
    articleType: signal<ArticleOption | null>(null),
  };

  actions: TableAction[] = [{
    label: 'Crear salida', icon: 'bi bi-box-seam', class: 'item-createEntry',
    action: row => this.createOutputs(row),
  }];

  loadSelections() {
    this.loadCatalog(this.service.getRequestStatuses(), this.status, 'los estados de solicitud');
    this.loadCatalog(this.service.getRequestTypes(), this.requestTypes, 'los tipos de solicitud');
    this.loadCatalog(this.intranet.getAllRecinto(), this.campuses, 'los recintos');
    this.loadArticleTypes();
  }

  loadArticleTypes(filter = '') {
    this.articleRequest?.unsubscribe();
    this.articleRequest = this.loadCatalog(
      this.productTypes.getAll({ filter, page: 1, CantItems: 10 }), this.articleTypes, 'los tipos de artículo');
  }

  private loadCatalog<T>(source: Observable<ApiResponse<T[]>>, target: WritableSignal<T[]>, name: string) {
    return source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (response.success === false) { this.alert.error(`No se pudieron cargar ${name}`); return; }
        target.set(response.data ?? []);
      },
      error: () => this.alert.error(`No se pudieron cargar ${name}`),
    });
  }

  private filter<T extends { nombre: string }>(items: T[], search: string) {
    return items.filter(item => item.nombre.toLowerCase().includes(search.trim().toLowerCase()));
  }

  openDialog(id: number) { this.dialogService.open(RequestDetail, id); }

  createOutputs(row: any) {
    this.router.navigate(['/layout/salidas/gestionar-Salidas'], { state: { requestId: row.row.id } });
  }

  clearSelections() {
    this.filterSelections.status.set(null);
    this.filterSelections.requestType.set(null);
    this.filterSelections.campus.set(null);
    this.filterSelections.articleType.set(null);
    this.statusSearch.set('');
    this.requestTypeSearch.set('');
    this.campusSearch.set('');
    this.loadArticleTypes();
  }
}
