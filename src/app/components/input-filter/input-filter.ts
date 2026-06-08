import { Component, EventEmitter, input, model, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-input-filter',
  imports: [],
  templateUrl: './input-filter.html',
  styleUrl: './input-filter.css',
})
export class InputFilter {
  filter = model('');
  placeholder = input<string>('');
}
