import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-form-actions',
  imports: [],
  standalone: true,
  templateUrl: './form-actions.html',
  styleUrl: './form-actions.css',
})
export class FormActions {
  nameActionBoton = input<string>('Guardar');
  iconActionBoton = input<string>('bi bi-send');

  editing = input(false);
  disabled = input(false);

  clear = output<void>();
}
