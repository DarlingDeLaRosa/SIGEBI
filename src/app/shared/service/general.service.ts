import { Injectable } from '@angular/core';
import { BaseApiService } from '../abstracts/base-api-service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interface/abstracts-class';

@Injectable({
    providedIn: 'root',
})
export class IntranetService extends BaseApiService<any> {
    constructor() { super(`${environment.apiUrlIntranet}`) }

    getAllRecinto() {
        return this.get<ApiResponse<any[]>>(`GenericService/getallrecintos`);
    }
    
    getAllAreas() {
        return this.get<ApiResponse<any[]>>(`GenericService/get_areas`);
    }
}
