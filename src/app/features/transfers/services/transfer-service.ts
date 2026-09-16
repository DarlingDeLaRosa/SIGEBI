import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BaseApiService } from '../../../shared/abstracts/base-api-service';
import { ApiResponse } from '../../../shared/interface/abstracts-class';
import { environment } from '../../../../environments/environment';
import { TransferListDto } from '../DTOs/transfer-dto';
import { TransferModel } from '../model/transfer-model';
import { TransferMapper } from '../mappers/transfer-mapper';

export interface TransferQuery {
  filter?: string;
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
    const filter = query.filter?.trim() ?? '';
    const page = query.page ?? 1;
    const pageSize = query.CantItems ?? 10;
    const path = filter
      ? `gettrasferencias_filter/${encodeURIComponent(filter)}/${page}/${pageSize}`
      : `gettrasferencias/${page}/${pageSize}`;

    return this.get<TransferListDto>(path).pipe(
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
