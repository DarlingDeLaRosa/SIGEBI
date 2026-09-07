import { Injectable } from '@angular/core';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/interface/abstracts-class';

@Injectable({
  providedIn: 'root',
})
export class StockEntryService extends BaseApiService<any> {
  constructor() { super(`${environment.apiUrl}/Entrada`) }

  getEntryByIdOrden(id: number) {
    return this.get<ApiResponse<any[]>>(`by_idOrden/${id}`);
  }

  getFiltersEntries(body: any) {
    return this.post<ApiResponse<any[]>>('getFilters', body);
  }
}
