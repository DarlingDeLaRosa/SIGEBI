import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { map } from 'rxjs';
import { ApiResponse } from '../../../shared/interface/abstracts-class';
import { OutputModel } from '../model/output-model';

export interface OutputQuery {
  page?: number;
  CantItems?: number;
  idRecinto?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class OutputService extends BaseApiService<any>{
   constructor() { super(`${environment.apiUrl}/Salida`) }

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
      return super.getAll({ page, CantItems: pageSize, idRecinto: params.idRecinto }).pipe(
         map(response => {
            if (response.success === false) throw new Error(response.message || 'No se pudieron cargar las salidas');
            return {
               ...response,
               data: response.data ?? [],
               currentPage: page,
               cantItem: pageSize,
               cantPage: Math.max(1, response.cantPage ?? 1),
            };
         }),
      );
   }
}
