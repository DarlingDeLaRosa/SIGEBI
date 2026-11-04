import { computed, DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { IntranetService } from '../../../shared/service/general.service';
import { StockOutputService } from '../../maintenance/services/stockOutput/stock-output-service';
import { RequestsService } from '../../requests/services/requests-service';
import { Alert } from '../../../core/service/alert-service/alert';

export interface OutputDepartmentOption { idDepartamento: number; nombre: string; }
export interface OutputTypeOption { idTipoSalida: number; nombre: string; }
export interface OutputCampusOption { idRecinto: number; nombre: string; }
export interface OutputRequestOption { id: number; noRequerimiento: string | null; }

@Injectable()
export class OutputsFacade {
  private intranet = inject(IntranetService);
  private outputTypesService = inject(StockOutputService);
  private requestsService = inject(RequestsService);
  private alert = inject(Alert);
  private destroyRef = inject(DestroyRef);
  private typesRequest?: Subscription;
  private requestsRequest?: Subscription;

  readonly departments = signal<OutputDepartmentOption[]>([]);
  readonly types = signal<OutputTypeOption[]>([]);
  readonly campuses = signal<OutputCampusOption[]>([]);
  readonly requests = signal<OutputRequestOption[]>([]);
  readonly departmentSearch = signal('');
  readonly campusSearch = signal('');
  readonly filteredDepartments = computed(() => this.filter(this.departments(), this.departmentSearch()));
  readonly filteredCampuses = computed(() => this.filter(this.campuses(), this.campusSearch()));
  readonly selectedDepartment = signal<OutputDepartmentOption | null>(null);
  readonly selectedType = signal<OutputTypeOption | null>(null);
  readonly selectedCampus = signal<OutputCampusOption | null>(null);
  readonly selectedRequest = signal<OutputRequestOption | null>(null);

  loadCatalogs() {
    this.loadCatalog(this.intranet.getAllDepartments(), this.departments, 'los departamentos');
    this.loadCatalog(this.intranet.getAllRecinto(), this.campuses, 'los recintos');
    this.loadTypes();
    this.loadRequests();
  }

  loadTypes(filter = '') {
    this.typesRequest?.unsubscribe();
    this.typesRequest = this.loadCatalog(this.outputTypesService.getAll({ filter, page: 1, CantItems: 10 }),
      this.types, 'los tipos de salida');
  }

  loadRequests(noRequerimiento = '') {
    this.requestsRequest?.unsubscribe();
    this.requestsRequest = this.loadCatalog(this.requestsService.getAll({ noRequerimiento, page: 1, CantItems: 10 }),
      this.requests, 'las solicitudes');
  }

  private loadCatalog<T>(source: Observable<{ data: T[]; success?: boolean; status?: boolean }>,
    target: WritableSignal<T[]>, label: string) {
    return source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (response.success === false || response.status === false) {
          this.alert.error(`No se pudieron cargar ${label}`); return;
        }
        target.set(response.data ?? []);
      },
      error: () => this.alert.error(`No se pudieron cargar ${label}`),
    });
  }

  private filter<T extends { nombre: string }>(items: T[], search: string) {
    return items.filter(item => (item.nombre ?? '').toLowerCase().includes(search.trim().toLowerCase()));
  }

  clearSelections() {
    this.selectedDepartment.set(null);
    this.selectedType.set(null);
    this.selectedCampus.set(null);
    this.selectedRequest.set(null);
    this.departmentSearch.set('');
    this.campusSearch.set('');
  }
}
