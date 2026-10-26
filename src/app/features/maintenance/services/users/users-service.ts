import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BaseApiService } from '../../../../shared/abstracts/base-api-service';
import { ApiResponse } from '../../../../shared/interface/abstracts-class';
import { INTRANET_SYSTEM_ID, SIGEBI_SYSTEM_ID } from '../../../../shared/constant/system';
import { environment } from '../../../../../environments/environment';
import { IntranetResponse, SystemAssignment, SystemPerson, SystemRole, SystemUser } from '../../DTO/users';

function requireSuccess<T>(response: IntranetResponse<T>) {
  if (response.status !== true) throw new Error(response.message || 'La intranet no pudo completar la operación');
  return response;
}

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseApiService<SystemUser> {
  constructor() { super(`${environment.apiUrlIntranet}/User`); }

  override getAll(params: { filter?: string; page?: number; CantItems?: number } = {}) {
    const page = params.page ?? 1;
    const size = params.CantItems ?? 10;
    return this.http.get<IntranetResponse<SystemUser[]>>(
      `${this.endpoint}/getusuariossistema/${SIGEBI_SYSTEM_ID}`,
      { params: { filter: params.filter ?? '', currentPage: page, totalItem: size } },
    ).pipe(map(requireSuccess), map(response => ({
      data: (response.data ?? []).map((user: SystemUser) => ({ ...user, rowKey: `${user.idUsuario}-${user.idRol}` })),
      currentPage: response.currentPage ?? page,
      cantItem: size,
      cantPage: Math.max(1, response.totalPage ?? 1),
      totalItems: response.totalItem ?? 0,
      dateNow: '',
      message: response.message ?? '',
      success: true,
    } satisfies ApiResponse<SystemUser[]> & { totalItems: number })));
  }

  searchPeople(filter: string, page = 1, pageSize = 10) {
    return this.http.get<IntranetResponse<SystemUser[]>>(
      `${this.endpoint}/getusuariossistema/${INTRANET_SYSTEM_ID}`,
      { params: { filter, currentPage: page, totalItem: pageSize } },
    ).pipe(map(requireSuccess), map(response => (response.data ?? []).map((user: SystemUser): SystemPerson => {
      const nombre = user.persona?.nombre ?? user.usuario ?? '';
      const apellidos = user.persona?.apellidos ?? '';
      return {
        ...user.persona,
        idPersona: user.idPersona,
        idUsuario: user.idUsuario,
        nombre,
        apellidos,
        nombreCompleto: [nombre, apellidos].filter(Boolean).join(' ').trim(),
      };
    })));
  }

  getRoles() {
    return this.http.get<IntranetResponse<SystemRole[]>>(
      `${environment.apiUrlIntranet}/Rol/getrolesbyidsistema/${SIGEBI_SYSTEM_ID}`,
    ).pipe(map(requireSuccess), map(response => response.data ?? []));
  }

  addToSystem(assignment: SystemAssignment) {
    return this.http.post<IntranetResponse<string>>(
      `${environment.apiUrlIntranet}/Sistema/add-user-system`,
      { ...assignment, idSistema: SIGEBI_SYSTEM_ID },
    ).pipe(map(requireSuccess));
  }

  removeFromSystem(assignment: SystemAssignment) {
    return this.http.post<IntranetResponse<string>>(
      `${environment.apiUrlIntranet}/Sistema/remove-user-system`,
      { ...assignment, idSistema: SIGEBI_SYSTEM_ID },
    ).pipe(map(requireSuccess));
  }
}
