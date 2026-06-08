import { Component, inject } from '@angular/core';
import { Loading } from '../../../core/service/loading-service/loading';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-toast',
  imports: [CommonModule],
  templateUrl: './loading-toast.html',
  styleUrl: './loading-toast.css',
})
export class LoadingToast {
  loadingService = inject(Loading);
}
