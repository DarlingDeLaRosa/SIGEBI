import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { UsersColumns } from '../../../../shared/constant/table-columns';
import { SIGEBI_SYSTEM_ID } from '../../../../shared/constant/system';
import { TableAction } from '../../../../interfaces/table-content-interface';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SystemPerson, SystemRole, SystemUser } from '../../DTO/users';
import { UsersService } from '../../services/users/users-service';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, SearchSelect, InputFilter, FormActions, TableOfContent],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users extends BaseCrud<SystemUser> implements OnInit {

  private fb = inject(FormBuilder);
  private service = inject(UsersService);
  private destroyRef = inject(DestroyRef);
  private listRequest?: Subscription;
  private personRequest?: Subscription;
  private personSelect = viewChild<SearchSelect>('personSelect');
  private roleSelect = viewChild<SearchSelect>('roleSelect');

  tableColumns = UsersColumns;
  people = signal<SystemPerson[]>([]);
  roles = signal<SystemRole[]>([]);
  selectedPerson = signal<SystemPerson | null>(null);
  selectedRole = signal<SystemRole | null>(null);
  roleSearch = signal('');
  filteredRoles = computed(() => this.roles().filter(role =>
    role.nombre.toLowerCase().includes(this.roleSearch().toLowerCase())));
  loading = signal(false);
  loadingRoles = signal(false);
  saving = signal(false);
  listError = signal('');
  rolesError = signal('');
  userForm = this.fb.nonNullable.group({
    idUsuario: [0, [Validators.required, Validators.min(1)]],
    idRol: [0, [Validators.required, Validators.min(1)]],
  });

  actions: TableAction[] = [{
    label: 'Remover persona del sistema', icon: 'bi bi-person-dash', class: 'item-delete',
    action: event => this.removeUser(event.row),
  }];

  override getService() { return this.service; }

  ngOnInit() {
    this.loadData();
    this.loadRoles();
  }

  override loadData(params: { filter?: string } = {}) {
    this.listRequest?.unsubscribe();
    this.loading.set(true);
    this.listError.set('');
    this.listRequest = this.service.getAll({
      filter: this.search(), page: this.pagination().currentPage, CantItems: this.pagination().pageSize, ...params,
    }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: response => {
        this.data.set(response);
        this.pagination.set({
          currentPage: response.currentPage, pageSize: response.cantItem,
          totalPages: response.cantPage, totalItems: response.totalItems
        });
      },
      error: () => this.listError.set('No se pudieron cargar los usuarios de SIGEBI. Intenta nuevamente'),
    });
  }

  loadRoles() {
    this.loadingRoles.set(true);
    this.rolesError.set('');
    this.service.getRoles().pipe(takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingRoles.set(false))).subscribe({
        next: roles => this.roles.set(roles),
        error: () => { this.roles.set([]); this.rolesError.set('No se pudieron cargar los roles de SIGEBI'); },
      });
  }

  personSearchChanged() {
    this.personRequest?.unsubscribe();
    this.people.set([]);
    this.selectedPerson.set(null);
    this.userForm.patchValue({ idUsuario: 0 });
    this.userForm.markAsDirty();
  }

  loadPeople(filter: string) {
    this.personRequest?.unsubscribe();
    if (!filter.trim()) { this.people.set([]); return; }
    this.personRequest = this.service.searchPeople(filter.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: people => this.people.set(people),
      error: () => { this.people.set([]); this.alert.error('No se pudieron buscar las personas'); },
    });
  }

  selectPerson(person: SystemPerson | null) {
    this.selectedPerson.set(null);
    this.userForm.patchValue({ idUsuario: 0 });
    this.userForm.markAsDirty();
    if (!person) { this.personSelect()?.clear(); return; }
    if (typeof person.idUsuario !== 'number' || !Number.isInteger(person.idUsuario) || person.idUsuario <= 0) {
      this.personSelect()?.clear();
      this.alert.error('Esta persona no tiene un usuario de intranet válido. No se puede agregar a SIGEBI');
      return;
    }
    this.selectedPerson.set(person);
    this.userForm.patchValue({ idUsuario: person.idUsuario });
  }

  selectRole(role: SystemRole | null) {
    this.selectedRole.set(role);
    this.userForm.patchValue({ idRol: role?.idRol ?? 0 });
    this.userForm.markAsDirty();
  }

  clearForm() {
    this.personRequest?.unsubscribe();
    this.userForm.reset();
    this.people.set([]);
    this.selectedPerson.set(null);
    this.selectedRole.set(null);
    this.roleSearch.set('');
    this.personSelect()?.clear();
    this.roleSelect()?.clear();
  }

  override save() {
    if (this.saving() || this.loadingRoles()) return;
    if (this.userForm.invalid || !this.selectedPerson() || !this.roles().some(role => role.idRol === this.userForm.controls.idRol.value)) {
      this.userForm.markAllAsTouched(); return;
    }
    const value = this.userForm.getRawValue();
    if (this.data()?.data.some((user: SystemUser) => user.idUsuario === value.idUsuario && user.idRol === value.idRol)) {
      this.alert.error('La persona ya tiene este rol en SIGEBI'); return;
    }
    this.saving.set(true);
    this.service.addToSystem({ ...value, idSistema: SIGEBI_SYSTEM_ID })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false))).subscribe({
        next: () => {
          this.clearForm();
          this.pagination.update(state => ({ ...state, currentPage: 1 }));
          this.loadData();
          this.alert.success('Persona agregada a SIGEBI');
        },
        error: error => this.alert.error(error.error?.message || error.message || 'No se pudo agregar la persona a SIGEBI'),
      });
  }

  async removeUser(user: SystemUser) {
    if (this.saving()) return;
    if (!user.idUsuario || user.rol!= null && !user.rol.idRol) { this.alert.error('No se pudo identificar el usuario y rol de esta asignación'); return; }
    this.saving.set(true);
    try {
      const result = await this.alert.confirmDelete('¿Remover persona de SIGEBI?',
        `Se quitará el acceso de ${[user.persona?.nombre, user.persona?.apellidos].filter(Boolean).join(' ') || user.usuario} a SIGEBI. Su cuenta de intranet se conserva.`, 'Remover');
      if (!result.isConfirmed || this.destroyRef.destroyed) { this.saving.set(false); return; }
      this.service.removeFromSystem({ idUsuario: user.idUsuario, idRol: user.idRol != null ? user.idRol : 0 , idSistema: SIGEBI_SYSTEM_ID })
        .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false))).subscribe({
          next: () => {
            if (this.userForm.controls.idUsuario.value === user.idUsuario) this.clearForm();
            if (this.data()?.data.length === 1 && this.pagination().currentPage > 1)
              this.pagination.update(state => ({ ...state, currentPage: state.currentPage - 1 }));
            this.loadData();
            this.alert.success('Persona removida de SIGEBI');
          },
          error: error => this.alert.error(error.error?.message || error.message || 'No se pudo remover la persona de SIGEBI'),
        });
    } catch {
      this.saving.set(false);
      this.alert.error('No se pudo confirmar la remoción');
    }
  }
}
