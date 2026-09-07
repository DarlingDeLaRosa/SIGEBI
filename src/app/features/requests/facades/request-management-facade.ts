import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal
} from '@angular/core';

import { FormGroup } from '@angular/forms';

import { RequestMapper } from '../mapper/request-mapper';
import { RequestsService } from '../services/requests-service';
import {
  RequestDetailFormValue,
  RequestFormValue
} from '../DTOs/request-form-values';

@Injectable()
export class RequestFormFacade {

  private requestService = inject(RequestsService);

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------

  sectionOpenGeneral = signal(true);
  sectionOpenDetail = signal(true);

  // -----------------------------------------------------
  // Detalles
  // -----------------------------------------------------

  details = signal<RequestDetailFormValue[]>([]);

  // -----------------------------------------------------
  // Selecciones
  // -----------------------------------------------------

  formSelections = {

    idRecinto: signal<any | null>(null),

    idTipoArticulo: signal<any | null>(null),

    idTipoSolicitud: signal<any | null>(null),

    idProducto: signal<any | null>(null)

  };

  // -----------------------------------------------------
  // Datos de selects
  // -----------------------------------------------------

  recinto = signal<any[]>([]);
  tipoArticulo = signal<any[]>([]);
  tipoSolicitud = signal<any[]>([]);
  products = signal<any[]>([]);

  // -----------------------------------------------------
  // Loading
  // -----------------------------------------------------

  loading = signal(false);

  // -----------------------------------------------------
  // Agregar detalle
  // -----------------------------------------------------

  addDetail(form: FormGroup) {

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const detail = form.getRawValue() as RequestDetailFormValue;

    this.details.update(details => [
      ...details,
      detail
    ]);

    form.reset({
      idProducto: 0,
      nombreProducto: '',
      cantidadSolicitada: 0
    });

    this.clearDetailSelection();
  }

  // -----------------------------------------------------
  // Editar detalle
  // -----------------------------------------------------

  editDetail(
    event: any,
    form: FormGroup
  ) {

    const detail = event.row;

    form.patchValue({
      idProducto: detail.idProducto,
      nombreProducto: detail.nombreProducto,
      cantidadSolicitada: detail.cantidadSolicitada
    });

    this.formSelections.idProducto.set({
      idProducto: detail.idProducto,
      nombre: detail.nombreProducto
    });

    this.clearDetail(
      event.index,
      this.details
    );

    form.markAsDirty();
  }

  // -----------------------------------------------------
  // Eliminar detalle
  // -----------------------------------------------------

  clearDetail(
    index: number,
    target: WritableSignal<any[]>
  ) {

    target.update(items =>
      items.filter((_, i) => i !== index)
    );
  }

  // -----------------------------------------------------
  // Totales / cantidades
  // -----------------------------------------------------

  totalDetails = computed(() =>
    this.details().reduce(
      (total, detail) =>
        total + detail.cantidadSolicitada,
      0
    )
  );

  // -----------------------------------------------------
  // Selección producto
  // -----------------------------------------------------

  selectProduct(
    product: any,
    form: FormGroup
  ) {

    if (!product) return;

    this.formSelections.idProducto.set(product);

    form.patchValue({
      idProducto: product.idProducto,
      nombreProducto: product.nombre
    });
  }

  // -----------------------------------------------------
  // Limpiar selección producto
  // -----------------------------------------------------

  clearDetailSelection() {

    this.formSelections.idProducto.set(null);

  }

  // -----------------------------------------------------
  // Limpiar detalles
  // -----------------------------------------------------

  clearDetails() {

    this.details.set([]);

  }

  // -----------------------------------------------------
  // Limpiar todo
  // -----------------------------------------------------

  clearSelections() {

    this.formSelections.idRecinto.set(null);
    this.formSelections.idTipoArticulo.set(null);
    this.formSelections.idTipoSolicitud.set(null);
    this.formSelections.idProducto.set(null);

  }

  // -----------------------------------------------------
  // Crear DTO
  // -----------------------------------------------------

  buildCreateDto(form: FormGroup) {

    return RequestMapper.toCreateDto(
      form.getRawValue() as RequestFormValue,
      this.details()
    );

  }

  // -----------------------------------------------------
  // Guardar
  // -----------------------------------------------------

  create(
    form: FormGroup,
    onSuccess?: () => void
  ) {

    if (
      form.invalid ||
      this.details().length === 0
    ) {

      form.markAllAsTouched();

      return;

    }

    const dto = this.buildCreateDto(form);

    this.loading.set(true);

    this.requestService
      .create(dto)
      .subscribe({

        next: () => {

          this.loading.set(false);

          this.clearDetails();
          this.clearSelections();

          form.reset({
            idRecinto: 0,
            idTipoArticulo: 0,
            idTipoSolicitud: 0,
            solicitante: '',
            cargoSolicitante: '',
            unidadOrganizativa: '',
            observaciones: ''
          });

          onSuccess?.();

        },

        error: () => {

          this.loading.set(false);

        }

      });
  }

}