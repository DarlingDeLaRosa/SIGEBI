import { Component, input } from '@angular/core';
import { DialogSkeletonConfig } from '../../../features/purchases-contracts/DTOs/purchase-contract-details';

@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {

  config = input<DialogSkeletonConfig>({ cards: 6, columns: 2 });

  get cards() {
    return Array.from({ length: this.config().cards ?? 0 });
  }

  get sections() {
    return this.config().sections ?? [];
  }

  get listItems() {
    return Array.from({ length: this.config().list?.items ?? 0 });
  }
}
