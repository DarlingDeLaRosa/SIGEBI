import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { BaseApiService } from '../../../../shared/abstracts/base-api-service';
import { ApiResponse } from '../../../../shared/interface/abstracts-class';

@Injectable({
  providedIn: 'root',
})
export class SuppliersService extends BaseApiService<any> {

  constructor() {
    super(`${environment.apiUrl}/Proveedor`)
  }

  getByName(nombre: string) {
    return this.get<ApiResponse<any[]>>(`consultaproveedorbynombre?nombre=${nombre}`);
  }

  getByRNC(nombre: string) {
    return this.get<ApiResponse<any[]>>(`consultaproveedorbyrnc/${nombre}`);
  }
}
