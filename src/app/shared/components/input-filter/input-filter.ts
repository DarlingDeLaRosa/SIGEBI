import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-filter',
  imports: [CommonModule],
  templateUrl: './input-filter.html',
  styleUrl: './input-filter.css',
})
export class InputFilter {
  colspan = input<number>(4);
  filter = model('');
  placeholder = input<string>('');
}
