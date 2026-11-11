import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MaterialModules } from '../shared/material';
import { LoadingToast } from '../shared/components/loading-toast/loading-toast';
import { clearSession, INTRANET_URL, readSessionUser } from '../features/auth/auth-session';
import { Alert } from '../core/service/alert-service/alert';

function displayText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

@Component({
  selector: 'app-layout',
  imports: [...MaterialModules, RouterOutlet, RouterLink, RouterLinkActive, LoadingToast],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly alert = inject(Alert);
  private readonly user = readSessionUser();
  readonly campus = displayText(this.user?.recinto?.siglas);
  readonly role = displayText(this.user?.rol?.nombre);
  readonly fullName = [displayText(this.user?.nombre), displayText(this.user?.apellidos)]
    .filter(Boolean).join(' ');
  sidenavOpened = true;

  async logout(): Promise<void> {
    const result = await this.alert.confirmDelete(
      '¿Deseas cerrar la sesión?',
      'Volverás a Intranet.',
      'Cerrar sesión',
    );
    if (!result.isConfirmed) return;

    clearSession();
    window.location.replace(INTRANET_URL);
  }
}
