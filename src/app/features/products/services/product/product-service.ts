import { Injectable } from '@angular/core';
import { BaseApiService } from '../../../../shared/abstracts/base-api-service';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseApiService<any>{
  constructor(){super(`${environment.apiUrl}/Producto`)}
}
