import { CreateRequestDto, RequestDetailDto } from '../DTOs/request-form-dto';
import {
  RequestDetailFormValue,
  RequestFormValue
} from '../DTOs/request-form-values';

export class RequestMapper {

  static toCreateDto(
    form: RequestFormValue,
    details: RequestDetailFormValue[]
  ): CreateRequestDto {

    return {
      idRecinto: form.idRecinto,
      idTipoArticulo: form.idTipoArticulo,
      idTipoSolicitud: form.idTipoSolicitud,

      solicitante: form.solicitante,
      cargoSolicitante: form.cargoSolicitante,
      unidadOrganizativa: form.unidadOrganizativa,
      observaciones: form.observaciones,

      detalles: details.map<RequestDetailDto>(detail => ({
        idProducto: detail.idProducto,
        cantidadSolicitada: detail.cantidadSolicitada
      }))
    };
  }
}