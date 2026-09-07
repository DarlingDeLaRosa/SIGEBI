import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-form-actions',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './form-actions.html',
  styleUrl: './form-actions.css',
})
export class FormActions {
  colspan = input<number>(12);

  nameActionBoton = input<string>('Guardar');
  iconActionBoton = input<string>('bi bi-send');

  editing = input(false);
  disabled = input(false);

  clear = output<void>();
}
