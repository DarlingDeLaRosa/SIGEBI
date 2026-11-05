import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { ApiResponse } from '../../../shared/interface/abstracts-class';
import { environment } from '../../../../environments/environment';
import { TransferListDto } from '../DTOs/transfer-dto';
import { TransferModel } from '../model/transfer-model';
import { TransferMapper } from '../mappers/transfer-mapper';
import { TransferFilters } from '../DTOs/transfer-filters';

export interface TransferQuery extends Partial<TransferFilters> {
  page?: number;
  CantItems?: number;
}

export interface TransferPage extends ApiResponse<TransferModel[]> {
  totalItems: number | null;
}

@Injectable({ providedIn: 'root' })
export class TransferService extends BaseApiService<TransferModel> {
  constructor() {
    super(`${environment.apiUrl}/Salida`);
  }

  override getAll(query: TransferQuery = {}) {
    const page = query.page ?? 1;
    const pageSize = query.CantItems ?? 10;
    let params = new HttpParams()

    const creadoPor = query.CreadoPor?.trim();
    const estado = query.Estado?.trim();

    if (creadoPor) params = params.set('CreadoPor', creadoPor);
    if (estado) params = params.set('Estado', estado);
    if (query.Desde?.trim()) params = params.set('Desde', query.Desde.trim());
    if (query.Hasta?.trim()) params = params.set('Hasta', query.Hasta.trim());

    return this.http.get<TransferListDto>(`${this.endpoint}/gettrasferencias/${page}/${pageSize}`, { params }).pipe(
      map((response): TransferPage => {
        if (!response.success)
          throw new Error(response.message || 'No se pudieron cargar las transferencias.');
        const items = response.data ?? [];
        return {
          data: items.map((item) => TransferMapper.fromApi(item)),
          success: response.success,
          message: response.message,
          dateNow: response.dateNow,
          currentPage:
            response.currentPage && response.currentPage > 0 ? response.currentPage : page,
          cantItem: pageSize,
          cantPage: Math.max(1, response.cantPage ?? 1),
          totalItems: response.totalItems ?? (items.length === 0 && page === 1 ? 0 : null),
        };
      }),
    );
  }
}
