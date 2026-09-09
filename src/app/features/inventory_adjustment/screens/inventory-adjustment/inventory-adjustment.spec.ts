import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it } from 'vitest';
import { InventoryAdjustment } from './inventory-adjustment';

describe('InventoryAdjustment', () => {
  it('renders pagination without inventing a total when the API returns null', async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAdjustment],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const fixture = TestBed.createComponent(InventoryAdjustment);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    for (const request of http.match(() => true)) {
      request.flush({
        success: true,
        data: [],
        currentPage: 1,
        cantPage: 3,
        cantItem: 10,
        totalItems: null,
      });
    }
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Listado de conciliaciones');
    expect(element.textContent).toContain('Página 1 de 3');
    expect(element.textContent).not.toContain('Total:');
    const next = [...element.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Siguiente',
    );
    expect(next?.disabled).toBe(false);
    http.verify();
  });
});
