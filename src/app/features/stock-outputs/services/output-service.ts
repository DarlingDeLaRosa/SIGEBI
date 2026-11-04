import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { map } from 'rxjs';
import { ApiResponse } from '../../../shared/interface/abstracts-class';
import { OutputModel } from '../model/output-model';
import { CreateOutputDto, DispatchProduct, OutputEntry } from '../DTOs/outputs-form-dto';
import { OutputFilters } from '../DTOs/output-filters';

export interface OutputQuery extends Partial<OutputFilters> {
  page?: number;
  CantItems?: number;
}

@Injectable({
  providedIn: 'root',
})
export class OutputService extends BaseApiService<any>{
   constructor() { super(`${environment.apiUrl}/Salida`) }

   getDispatchProduct(id: number) {
      return this.http.get<ApiResponse<DispatchProduct | null>>(`${environment.apiUrl}/Producto/${id}`).pipe(
         map(response => {
            if (response.success === false || !response.data || response.data.idProducto !== id) throw new Error('No se pudo cargar el producto');
            return response.data;
         }),
      );
   }

   getProductEntries(productId: number, warehouseId: number) {
      return this.http.get<ApiResponse<OutputEntry[]>>(`${environment.apiUrl}/Entrada/by_idproducto_idtipoalmacen/${productId}/${warehouseId}`).pipe(
         map(response => {
            if (response.success === false) throw new Error('No se pudieron cargar las entradas');
            return response.data ?? [];
         }),
      );
   }

   createOutput(body: CreateOutputDto) {
      return this.http.post<ApiResponse<OutputModel | null>>(this.endpoint, body).pipe(
         map(response => {
            if (response.success === false) throw new Error(response.message || 'No se pudo guardar la salida');
            return response;
         }),
      );
   }

   getOutputDetails(id: number) {
      return this.http.get<ApiResponse<OutputModel | null>>(`${this.endpoint}/${id}`).pipe(
         map(response => {
            if (response.success === false) throw new Error(response.message || 'No se pudo cargar la salida');
            return response.data?.idSalida === id ? response.data : null;
         }),
      );
   }

   override getAll(params: OutputQuery = {}) {
      const page = params.page ?? 1;
      const pageSize = params.CantItems ?? 10;
      const body: OutputFilters = {
         idDepartamento: params.idDepartamento ?? null,
         idTipoSalida: params.idTipoSalida ?? null,
         idRecinto: params.idRecinto ?? null,
         desde: params.desde?.trim() || null,
         hasta: params.hasta?.trim() || null,
         idSolicitud: params.idSolicitud ?? null,
         solicitante: params.solicitante?.trim() || null,
         noRequerimiento: params.noRequerimiento?.trim() || null,
      };
      return this.http.post<ApiResponse<OutputModel[]> & { totalItems?: number | null }>(`${this.endpoint}/filter`, body,
         { params: { page, CantItems: pageSize } }).pipe(
         map(response => {
            if (response.success === false) throw new Error(response.message || 'No se pudieron cargar las salidas');
            return {
               ...response,
               data: response.data ?? [],
               currentPage: page,
               cantItem: pageSize,
               cantPage: Math.max(1, response.cantPage ?? 1),
               totalItems: response.totalItems ?? null,
            };
         }),
      );
   }
}
