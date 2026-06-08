import { Injectable } from '@angular/core';
import { BaseApiService } from '../../../../shared/abstracts/base-api-service';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/interface/abstracts-class';

@Injectable({
  providedIn: 'root',
})
export class CatalogService extends BaseApiService<any> {
  constructor() {
    super(`${environment.apiUrl}/Catalogo`)
  }

  getAuxiliary(filter: string) {
    return this.get<ApiResponse<any[]>>(`auxiliares?filter=${filter}`);
  }
}
