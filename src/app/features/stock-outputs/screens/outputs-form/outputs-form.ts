import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SectionBox } from '../../../../shared/components/section-box/section-box';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { FormActions } from '../../../../shared/components/form-actions/form-actions';
import { SearchSelect } from '../../../../shared/components/search-select/search-select';
import { OutputDispatchColumns, OutputRequestDetailColumns, RequestList } from '../../../../shared/constant/table-columns';
import { Loading } from '../../../../core/service/loading-service/loading';
import { OutputsManagementFacade } from '../../facades/outputs-managment-facade';

@Component({
  selector: 'app-outputs-form',
  imports: [CommonModule, RouterLink, SearchSelect, FormActions, TableOfContent, ReactiveFormsModule, SectionBox],
  templateUrl: './outputs-form.html',
  styleUrl: './outputs-form.css',
  providers: [OutputsManagementFacade],
})
export class OutputsForm implements OnInit {
  readonly facade = inject(OutputsManagementFacade);
  readonly loading = inject(Loading).loading;
  readonly searchForm = inject(FormBuilder).nonNullable.group({ noRequerimiento: '' });
  readonly tableColumns = OutputDispatchColumns;
  readonly tableRequestColumns = RequestList;
  readonly tableRequestDetailColumns = OutputRequestDetailColumns;

  ngOnInit() {
    this.facade.loadData();
    const id = history.state?.requestId ?? history.state?.purchaseContract?.row?.id;
    if (Number.isInteger(id) && id > 0) this.facade.loadRequestById(id);
  }

  searchRequests() { this.facade.loadRequest(this.searchForm.controls.noRequerimiento.value); }

  selectOutputType(item: { idTipoSalida: number } | null) {
    this.facade.form.patchValue({ idTipoSalida: item?.idTipoSalida ?? 0 });
    this.facade.form.markAsDirty();
  }

  selectedOutputType() {
    return this.facade.outputTypes().find(item => item.idTipoSalida === this.facade.form.controls.idTipoSalida.value) ?? null;
  }

  campusName() {
    return this.facade.recintos().find(item => item.idRecinto === this.facade.form.controls.idRecinto.value)?.nombre
      || this.facade.selectedRequest()?.recintoObj?.nombre || 'No disponible';
  }

  selectedCondition() {
    const value = this.facade.detailForm.controls.condicion.value;
    return value ? { name: value, value } : null;
  }

  selectCondition(item: { value: string } | null) {
    this.facade.detailForm.patchValue({ condicion: item?.value ?? '' });
    this.facade.detailForm.markAsDirty();
  }

  selectEntry(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    this.facade.selectEntry(this.facade.entries().find(entry => entry.idEntradaDet === id) ?? null);
  }
}
