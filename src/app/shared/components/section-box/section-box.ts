import { Component, input, model, signal } from '@angular/core';

@Component({
  selector: 'app-section-box',
  imports: [],
  templateUrl: './section-box.html',
  styleUrl: './section-box.css',
})
export class SectionBox {
  title = input.required<string>();
  opened = model(true);

  toggle() { this.opened.update(value => !value); }
}
