import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';

@Injectable({
  providedIn: 'root',
})
export class OutputService extends BaseApiService<any>{
   constructor() { super(`${environment.apiUrl}/Salidas`) }
}
