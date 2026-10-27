import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { ApiResponse } from '../../../shared/interface/abstracts-class';
import { map } from 'rxjs';
import { CreateRequestDto } from '../DTOs/request-form-dto';
import { RequestModel } from '../model/request-model';

export interface RequestQuery {
   page?: number;
   CantItems?: number;
   filter?: string | null;
   estado?: number | null;
   noRequerimiento?: string | null;
   idEstadoSolicitud?: number | null;
   idTipoArticulo?: number | null;
   idTipoSolicitud?: number | null;
   unidadOrganizativa?: string | null;
   idRecinto?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class RequestsService extends BaseApiService<any> {
   constructor() { super(`${environment.apiUrl}/Solicitudes`) }

   override getAll(params: RequestQuery = {}) {
      const page = params.page ?? 1;
      const pageSize = params.CantItems ?? 10;
      const body = {
         page,
         CantItems: pageSize,
         noRequerimiento: (params.noRequerimiento ?? params.filter)?.trim() || null,
         idEstadoSolicitud: params.idEstadoSolicitud ?? params.estado ?? null,
         idTipoArticulo: params.idTipoArticulo ?? null,
         idTipoSolicitud: params.idTipoSolicitud ?? null,
         unidadOrganizativa: params.unidadOrganizativa?.trim() || null,
         idRecinto: params.idRecinto ?? null,
      };
      return this.http.post<ApiResponse<any[]> & { totalItems: number }>(this.endpoint, body).pipe(
         map(response => {
            if (response.success === false) throw new Error(response.message || 'No se pudieron cargar las solicitudes');
            return {
               ...response,
               data: response.data ?? [],
               currentPage: page,
               cantItem: pageSize,
               cantPage: Math.max(1, response.cantPage ?? 1),
               totalItems: response.totalItems ?? 0,
            };
         }),
      );
   }

   override create(body: CreateRequestDto) {
      return this.post<any>('create_solicitud', body);
   }

   getRequestDetails(id: number) {
      return this.http.get<ApiResponse<RequestModel | RequestModel[] | null>>(`${this.endpoint}/${id}`).pipe(
         map(response => {
            if (response.success === false) throw new Error(response.message || 'No se pudo cargar la solicitud');
            const request = Array.isArray(response.data)
               ? response.data.find(item => item.id === id)
               : response.data;
            return request?.id === id ? request : null;
         }),
      );
   }

   getRequestTypes() {
      return this.get<ApiResponse<{ id: number; nombre: string }[]>>('tipo_solicitudes');
   }

   getRequestStatuses() {
      return this.get<ApiResponse<{ id: number; nombre: string }[]>>('estados');
   }
}
