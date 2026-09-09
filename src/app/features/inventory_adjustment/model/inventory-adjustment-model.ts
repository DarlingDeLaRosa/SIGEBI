export interface InventoryAdjustmentParticipant {
  name: string;
  position: string;
}

export interface InventoryAdjustmentDetail {
  productId: number;
  productName: string;
  countedQuantity: number;
  inventoryQuantity: number;
  observations: string;
  entryDetailId: number;
  warehouseId: number;
  warehouseName: string;
  difference: number;
}

export interface InventoryAdjustmentModel {
  id: number;
  campusId: number | null;
  countNumber: string;
  warehouseId: number | null;
  warehouseName: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: InventoryAdjustmentParticipant[];
  details: InventoryAdjustmentDetail[];
}
