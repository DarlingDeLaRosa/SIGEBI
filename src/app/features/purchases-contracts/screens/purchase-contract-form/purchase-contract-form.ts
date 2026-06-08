import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchSelect } from '../../../../components/search-select/search-select';
import { FormActions } from '../../../../components/form-actions/form-actions';
import { TableOfContent } from '../../../../components/table-of-content/table-of-content';
import { BaseCrud } from '../../../../shared/abstracts/base-crud';
import { PurchaseContractService } from '../../purchase-contract-service';
import { PurchaseContractDetailsColumns } from '../../../../shared/table-columns';

@Component({
  selector: 'app-purchase-contract-form',
  imports: [CommonModule, RouterLink, SearchSelect, FormActions, TableOfContent],
  templateUrl: './purchase-contract-form.html',
  styleUrl: './purchase-contract-form.css',
})
export class PurchaseContractForm extends BaseCrud<any> implements OnInit {

  tableColums = PurchaseContractDetailsColumns

  private fb = inject(FormBuilder);
  ngOnInit(): void {

  }

  private purchaseService = inject(PurchaseContractService);
  override getService() { return this.purchaseService }

  // product_form = this.fb.nonNullable.group({
  //   idProducto: [0],
  //   nombre: ['', Validators.required],
  //   precio: [, Validators.required],
  //   itbis: [, Validators.required],
  //   idCatalogo: [, Validators.required],
  //   descripcion: ['', Validators.required],
  //   stockMinimo: [, Validators.required],
  //   idUnidadMe: [, Validators.required],
  //   idTipoArt: [, Validators.required],
  // });
}
