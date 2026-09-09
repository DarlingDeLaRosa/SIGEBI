import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { environment } from '../../../../environments/environment';
import {
  CreateInventoryAdjustmentDto,
  InventoryAdjustmentDto,
  InventoryAdjustmentFilterDto,
  InventoryAdjustmentResponse,
  UpdateInventoryAdjustmentDto,
} from '../DTOs/inventory-adjustment-dto';

export function unwrapAdjustmentResponse<T>(response: InventoryAdjustmentResponse<T> | T): T {
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === false
  ) {
    throw new Error(
      'message' in response ? String(response.message) : 'La operación no pudo completarse.',
    );
  }
  return response && typeof response === 'object' && 'data' in response
    ? response.data
    : (response as T);
}

@Injectable({ providedIn: 'root' })
export class InventoryAdjustmentService extends BaseApiService<CreateInventoryAdjustmentDto> {
  constructor() {
    super(`${environment.apiUrl}/AjusteInventario`);
  }

  searchAdjustments(filters: InventoryAdjustmentFilterDto, page: number, pageSize: number) {
    return this.http
      .post<InventoryAdjustmentResponse<InventoryAdjustmentDto[]>>(
        `${this.endpoint}/get_filter`,
        filters,
        {
          params: { page, CantItems: pageSize },
        },
      )
      .pipe(
        map((response) => {
          unwrapAdjustmentResponse(response);
          return response;
        }),
      );
  }

  getAdjustment(id: number) {
    return this.http
      .get<
        InventoryAdjustmentResponse<InventoryAdjustmentDto> | InventoryAdjustmentDto
      >(`${this.endpoint}/${id}`)
      .pipe(map((response) => unwrapAdjustmentResponse(response)));
  }

  saveAdjustment(body: CreateInventoryAdjustmentDto | UpdateInventoryAdjustmentDto) {
    const request = 'id' in body && body.id > 0 ? this.update(body) : this.create(body);
    return request.pipe(map((response) => unwrapAdjustmentResponse(response)));
  }
}
