import { Injectable } from '@angular/core';
import { BaseApiService } from '../../../../shared/abstracts/base-api-service';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockEntryTypeService extends BaseApiService<any>{
  constructor(){
    super(`${environment.apiUrl}/TipoEntrada`)
  }
}
