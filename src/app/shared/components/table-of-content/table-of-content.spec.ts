import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TableOfContent } from './table-of-content';

describe('TableOfContent', () => {
  let component: TableOfContent;
  let fixture: ComponentFixture<TableOfContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableOfContent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableOfContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('applies row rules to custom and built-in actions and rechecks them on click', () => {
    const received = { id: 1, estado: 'Recibida' };
    const pending = { id: 2, estado: 'Pendiente' };
    const rule = {
      disabled: (row: typeof received) => row.estado === 'Recibida',
      disabledReason: () => 'Esta orden ya fue recibida.',
    };
    const createEntry = vi.fn();
    const listEntries = vi.fn();
    const edit = vi.spyOn(component.edit, 'emit');
    const remove = vi.spyOn(component.remove, 'emit');
    const detail = vi.spyOn(component.showDialog, 'emit');
    fixture.componentRef.setInput('tableColumns', [{ key: 'id', label: 'Orden' }, { key: 'acciones', label: 'Acciones' }]);
    fixture.componentRef.setInput('tableData', [received, pending]);
    fixture.componentRef.setInput('showDetail', true);
    fixture.componentRef.setInput('actions', [
      { label: 'Crear entrada', icon: '', ...rule, action: createEntry },
      { label: 'Ver listado de entradas', icon: '', action: listEntries },
    ]);
    fixture.componentRef.setInput('basicActionRules', { edit: rule, remove: rule });
    fixture.detectChanges();

    const page: HTMLElement = fixture.nativeElement;
    const [receivedMenu, pendingMenu] = Array.from(page.querySelectorAll('.dropdown-menu'));
    const receivedButtons = Array.from(receivedMenu.querySelectorAll('button'));
    expect(receivedButtons.map(button => button.disabled)).toEqual([true, false, false, true, true]);
    expect(receivedMenu.querySelectorAll('li[tabindex="0"]')).toHaveLength(3);
    expect(receivedMenu.textContent).not.toContain('Esta orden ya fue recibida.');
    receivedButtons.forEach(button => button.click());
    expect(createEntry).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(detail).toHaveBeenCalledWith(received);
    expect(listEntries).toHaveBeenCalledWith({ row: received, index: 0 });

    const pendingButtons = Array.from(pendingMenu.querySelectorAll('button'));
    pendingButtons.forEach(button => button.click());
    expect(createEntry).toHaveBeenCalledWith({ row: pending, index: 1 });
    expect(edit).toHaveBeenCalledWith({ row: pending, index: 1 });
    expect(remove).toHaveBeenCalledWith({ row: pending, index: 1 });

    pending.estado = 'Recibida';
    pendingButtons[0].click();
    pendingButtons[3].click();
    pendingButtons[4].click();
    expect(createEntry).toHaveBeenCalledTimes(1);
    expect(edit).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('basicActionRules', {});
    fixture.detectChanges();
    expect(receivedMenu.querySelector<HTMLButtonElement>('.item-edit')?.disabled).toBe(false);
    expect(receivedMenu.querySelector<HTMLButtonElement>('.item-delete')?.disabled).toBe(false);
  });
});
