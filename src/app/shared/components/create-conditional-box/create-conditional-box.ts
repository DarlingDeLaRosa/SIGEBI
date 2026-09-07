import { Component, input } from '@angular/core';

@Component({
  selector: 'app-create-conditional-box',
  imports: [],
  templateUrl: './create-conditional-box.html',
  styleUrl: './create-conditional-box.css',
})
export class CreateConditionalBox {
  formName = input<string>('')
}
