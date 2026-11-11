import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Layout } from './layout';

describe('Layout', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [Layout],
    providers: [provideRouter([])],
  }));

  afterEach(() => sessionStorage.removeItem('userSystem'));

  it.each([
    ['REC', 'Administrador', 'Ana', 'Pérez'],
    ['STI', 'Consulta', 'Luis', 'Díaz'],
  ])('muestra el perfil guardado para el recinto %s', (siglas, role, nombre, apellidos) => {
    sessionStorage.setItem('userSystem', JSON.stringify({
      recinto: { siglas }, rol: { nombre: role }, nombre, apellidos,
    }));

    for (let attempt = 0; attempt < 2; attempt++) {
      const fixture = TestBed.createComponent(Layout);
      fixture.detectChanges();
      const page: HTMLElement = fixture.nativeElement;
      expect(page.querySelector('.departamento')?.textContent).toBe(siglas);
      expect(page.querySelector('.nombre')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(role + ', ' + nombre + ' ' + apellidos);
      fixture.destroy();
    }
  });

  it('muestra el nombre disponible cuando falta el rol o el recinto', () => {
    sessionStorage.setItem('userSystem', JSON.stringify({ nombre: ' Ana ', apellidos: null }));
    const fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.departamento')).toBeNull();
    expect(page.querySelector('.nombre')?.textContent?.trim()).toBe('Ana');
  });

  it('muestra el menú con un perfil corrupto', () => {
    sessionStorage.setItem('userSystem', '{');
    const fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.btnMenu')).toBeTruthy();
    expect(page.querySelector('.departamento, .nombre')).toBeNull();
  });
});
