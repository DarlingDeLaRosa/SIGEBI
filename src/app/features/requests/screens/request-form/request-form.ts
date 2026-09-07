import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RequestFormFacade } from '../../facades/request-management-facade';
import { RequestForms } from '../../forms/request-form';
import { SectionBox } from '../../../../shared/components/section-box/section-box';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { InputFilter } from '../../../../shared/components/input-filter/input-filter';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-form',
  imports: [CommonModule, RouterLink, FormsModule, SearchSelect, FormActions, InputFilter, TableOfContent, ReactiveFormsModule, SectionBox],
  templateUrl: './request-form.html',
  providers: [RequestFormFacade],
  styleUrl: './request-form.css',
})
export class RequestForm {


  private fb = inject(FormBuilder);
  facade = inject(RequestFormFacade);

  requestForm = RequestForms.createForm(this.fb);
  requestDetailForm = RequestForms.createDetailForm(this.fb);

  loading = this.facade.loading;

  tableColumns = [
    {
      key: 'nombreProducto',
      label: 'Producto'
    },
    {
      key: 'cantidadSolicitada',
      label: 'Cantidad'
    }
  ];

  constructor() {
    effect(() => {
      const product = this.facade.formSelections.idProducto();
      if (!product) return;
    });
  }

  setSelection(
    selection: any,
    form: FormGroup,
    controlName: string,
    event: any,
    valueField: string
  ) {

    if (!event) {

      selection.set(null);

      form.patchValue({
        [controlName]: 0
      });

      return;

    }

    selection.set(event);

    form.patchValue({
      [controlName]: event[valueField]
    });

  }

  productSelection(event: any) {

    this.facade.selectProduct(
      event,
      this.requestDetailForm
    );

  }

  save() {

    this.facade.create(
      this.requestForm,
      () => {

        console.log(
          'Solicitud creada correctamente'
        );

      }
    );

  }

}
