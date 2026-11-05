import { TransferDto, TransferUserDto } from '../DTOs/transfer-dto';
import { TransferModel } from '../model/transfer-model';

export class TransferMapper {
  static fromApi(transfer: TransferDto): TransferModel {
    return {
      id: transfer.id,
      date: transfer.fecha,
      status: transfer.estado?.trim() || 'Sin especificar',
      createdBy: this.userName(transfer.creadoPor),
      creatorPosition: this.userDetails(transfer.creadoPor)?.cargo ?? '',
      creatorCampus: this.userDetails(transfer.creadoPor)?.recinto?.nombre ?? '',
      verifiedBy: this.userName(transfer.verificadoPor),
      verifierPosition: this.userDetails(transfer.verificadoPor)?.cargo ?? '',
      // Keep these references distinct: Swagger does not document their direction.
      transferCampus: transfer.recinto?.nombre ?? '',
      outputCampus: transfer.salida?.recinto?.nombre ?? '',
      outputId: transfer.salida?.idSalida ?? null,
      department: transfer.salida?.departamento?.nombre ?? '',
      outputType: transfer.salida?.tipoSalida?.nombre ?? '',
      outputDate: transfer.salida?.fechaCreacion ?? null,
      modifiedDate: transfer.salida?.fechaModif ?? null,
      observations: transfer.salida?.observacion ?? '',
      total: transfer.salida?.total ?? null,
    };
  }

  private static userDetails(user: string | TransferUserDto | null) {
    return typeof user === 'string' ? null : user;
  }

  private static userName(user: string | TransferUserDto | null): string {
    if (typeof user === 'string') return user.trim();
    return [user?.nombre?.trim(), user?.apellido?.trim()].filter(Boolean).join(' ');
  }
}
