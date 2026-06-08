import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})

export class DialogService {
  private dialog = inject(MatDialog)

  open(component: any, data: any = null, width: string = '600px', disbleClose: boolean = false
  ) {
    return this.dialog.open(component, {
      width,
      data,
      disableClose: disbleClose
    });
  }
}
