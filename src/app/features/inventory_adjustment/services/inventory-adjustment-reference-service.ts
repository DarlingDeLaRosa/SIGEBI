import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { environment } from '../../../../environments/environment';
import {
  CampusDto,
  EntryDetailOptionDto,
  InventoryAdjustmentResponse,
} from '../DTOs/inventory-adjustment-dto';
import { unwrapAdjustmentResponse } from './inventory-adjustment-service';

@Injectable({ providedIn: 'root' })
export class InventoryAdjustmentReferenceService extends BaseApiService<CampusDto> {
  constructor() {
    super(environment.apiUrl);
  }

  getCampuses() {
    return this.get<InventoryAdjustmentResponse<CampusDto[]> | CampusDto[]>('Recinto').pipe(
      map((response) => unwrapAdjustmentResponse(response)),
    );
  }

  getEntryDetails(productId: number, warehouseId: number) {
    return this.get<InventoryAdjustmentResponse<EntryDetailOptionDto[]>>(
      `Entrada/by_idproducto_idtipoalmacen/${productId}/${warehouseId}`,
    ).pipe(map((response) => unwrapAdjustmentResponse(response)));
  }
}
