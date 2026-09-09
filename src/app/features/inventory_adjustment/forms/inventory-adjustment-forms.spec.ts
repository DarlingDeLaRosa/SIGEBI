import { FormBuilder } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { InventoryAdjustmentForms } from './inventory-adjustment-forms';

describe('InventoryAdjustmentForms', () => {
  const fb = new FormBuilder();
  it('rejects missing, fractional and negative counts but accepts zero', () => {
    const form = InventoryAdjustmentForms.detail(fb);
    form.patchValue({ productId: 1, entryDetailId: 2, inventoryQuantity: 10 });
    expect(form.invalid).toBe(true);
    for (const countedQuantity of [-1, 1.5]) {
      form.patchValue({ countedQuantity });
      expect(form.invalid).toBe(true);
    }
    form.patchValue({ countedQuantity: 0 });
    expect(form.valid).toBe(true);
    form.patchValue({ inventoryQuantity: null });
    expect(form.invalid).toBe(true);
  });
  it('validates required header values and chronological times', () => {
    const form = InventoryAdjustmentForms.create(fb);
    form.patchValue({ campusId: 1, warehouseId: 2, countNumber: ' ', date: '2026-09-07' });
    expect(form.invalid).toBe(true);
    form.patchValue({ countNumber: 'TF-01', startTime: '10:00', endTime: '09:00' });
    expect(form.hasError('timeOrder')).toBe(true);
    form.patchValue({ endTime: '' });
    expect(form.hasError('timePair')).toBe(true);
    form.patchValue({ endTime: '11:00' });
    expect(form.valid).toBe(true);
  });
});
