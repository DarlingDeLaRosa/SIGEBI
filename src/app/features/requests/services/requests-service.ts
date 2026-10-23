import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { ApiResponse } from '../../../shared/interface/abstracts-class';

@Injectable({
  providedIn: 'root',
})
export class RequestsService extends BaseApiService<any> {
   constructor() { super(`${environment.apiUrl}/Solicitudes`) }

   getRequestTypes() {
      return this.get<ApiResponse<{ id: number; nombre: string }[]>>('tipo_solicitudes');
   }
}
