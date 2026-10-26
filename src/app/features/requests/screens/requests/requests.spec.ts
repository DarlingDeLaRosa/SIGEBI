import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Requests } from './requests';
import { DialogService } from '../../../../core/service/dialog-service/dialog';
import { environment } from '../../../../../environments/environment';
import { By } from '@angular/platform-browser';
import { TableOfContent } from '../../../../shared/components/table-of-content/table-of-content';
import { RequestDetail } from '../../dialog/request-detail/request-detail';

const endpoint = `${environment.apiUrl}/Solicitudes`;
const page = { success: true, data: [], currentPage: 0, cantItem: 10, cantPage: 2, totalItems: 12 };

describe('Requests', () => {
  let fixture: ComponentFixture<Requests>;
  let http: HttpTestingController;
  let initialRequest: TestRequest;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Requests], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
      { provide: DialogService, useValue: { open: vi.fn() } },
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Requests);
    fixture.detectChanges();
    initialRequest = http.expectOne(endpoint);
    initialRequest.flush(page);
  });
  afterEach(() => http.verify());

  it('opens the detail dialog with the ID emitted by the table', () => {
    const table = fixture.debugElement.query(By.directive(TableOfContent)).componentInstance as TableOfContent;
    table.showDialog.emit({ id: 12 });
    expect(TestBed.inject(DialogService).open).toHaveBeenCalledWith(RequestDetail, 12);
  });

  it('loads using POST with only CantItems and a valid first page', () => {
    expect(initialRequest.request.method).toBe('POST');
    expect(initialRequest.request.params.keys()).toEqual([]);
    expect(initialRequest.request.body.CantItems).toBe(10);
    expect(Object.keys(initialRequest.request.body).filter(key => key.toLowerCase().startsWith('cantitem'))).toEqual(['CantItems']);
    expect(fixture.componentInstance.pagination().currentPage).toBe(1);
    http.expectNone(req => req.method === 'GET' && req.url === endpoint);
  });

  it('retains the form filters when changing page', () => {
    const component = fixture.componentInstance;
    component.filterForm.controls.filter.setValue('REQ-1');
    component.loadData();
    const filter = http.expectOne(endpoint);
    expect(filter.request.body.noRequerimiento).toBe('REQ-1');
    filter.flush(page);
    component.changePage(2);
    const next = http.expectOne(endpoint);
    expect(next.request.body).toMatchObject({ page: 2, CantItems: 10, noRequerimiento: 'REQ-1' });
    next.flush({ ...page, currentPage: 1 });
    expect(component.pagination().currentPage).toBe(2);
  });
});
