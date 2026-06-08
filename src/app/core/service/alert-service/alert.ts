import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Alert {
  
  confirmDelete(
    title: string = '¿Eliminar registro?',
    text: string = 'Esta acción no se puede deshacer.',
    confirmBtn = 'Eliminar',
    cancelBtn = 'Cancelar'
  ) {

    return Swal.fire({

      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmBtn,
      cancelButtonText: cancelBtn,
      reverseButtons: true,
      focusCancel: true,
      heightAuto: false,
      buttonsStyling: false,
      customClass: {
        popup: 'app-swal-popup',
        title: 'app-swal-title',
        htmlContainer: 'app-swal-text',
        confirmButton: 'app-swal-confirm',
        cancelButton: 'app-swal-cancel'
      }
    });
  }

  success(
    title: string = 'Proceso completado'
  ) {

    return Swal.fire({

      title,
      icon: 'success',
      timer: 1800,
      showConfirmButton: false,
      heightAuto: false,
      customClass: {
        popup: 'app-swal-popup',
        title: 'app-swal-title'
      }
    });
  }

  error(
    title: string = 'Ha ocurrido un error'
  ) {

    return Swal.fire({
      title,
      icon: 'error',
      confirmButtonText: 'Cerrar',
      heightAuto: false,
      buttonsStyling: false,
      customClass: {

        popup: 'app-swal-popup',
        title: 'app-swal-title',
        confirmButton: 'app-swal-confirm'

      }
    });
  }
}
