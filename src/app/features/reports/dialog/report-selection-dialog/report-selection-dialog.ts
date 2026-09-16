import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReportSelection } from '../../model/report-selection';

@Component({
  selector: 'app-report-selection-dialog',
  imports: [MatDialogModule],
  templateUrl: './report-selection-dialog.html',
  styleUrl: './report-selection-dialog.css',
})
export class ReportSelectionDialog {
  readonly selection = inject<ReportSelection>(MAT_DIALOG_DATA);
  readonly actionTitle = {
    view: 'Ver reporte',
    download: 'Descargar reporte',
    print: 'Imprimir formulario',
  };
  readonly availability = {
    view: 'La vista previa de este informe aún no está disponible.',
    download: 'La descarga de este informe aún no está disponible.',
    print: 'La impresión de este formulario aún no está disponible.',
  };
}
