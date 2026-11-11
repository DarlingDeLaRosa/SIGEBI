import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { timeout, timer } from 'rxjs';
import { AuthService } from '../../auth-service';
import { clearSession, INTRANET_URL, isCurrentSystemToken, readSessionToken, saveSession } from '../../auth-session';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly intranetUrl = INTRANET_URL;
  readonly error = signal('');

  ngOnInit(): void {
    const routeToken = this.route.snapshot.paramMap.get('token');
    const queryToken = this.route.snapshot.queryParamMap.get('token');
    const token = (routeToken ?? queryToken)?.trim();
    if (routeToken !== null || queryToken !== null) this.location.replaceState('/auth');

    if (!token) {
      if (routeToken === null && queryToken === null && isCurrentSystemToken(readSessionToken('userToken'))) {
        void this.router.navigateByUrl('/layout/inicio', { replaceUrl: true });
        return;
      }
      this.fail('Abre SIGEBI desde Intranet para recibir un token de acceso.');
      return;
    }

    clearSession();
    this.auth.exchange(token).pipe(timeout(15000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (response?.success === false) {
          this.fail('Intranet denegó el acceso a SIGEBI o el enlace ha vencido.');
          return;
        }
        if (response?.success !== true || !response.data || !isCurrentSystemToken(response.token)) {
          this.fail('Intranet devolvió una sesión incompleta o vencida.');
          return;
        }

        saveSession(response.token, token, response.data);
        void this.router.navigateByUrl('/layout/inicio', { replaceUrl: true });
      },
      error: error => this.fail(
        error instanceof HttpErrorResponse && [400, 401, 403].includes(error.status)
          ? 'Intranet denegó el acceso a SIGEBI o el enlace ha vencido.'
          : 'No se pudo conectar con el servicio de acceso. Intenta de nuevo desde Intranet.',
      ),
    });
  }

  private fail(message: string): void {
    clearSession();
    this.error.set(message);
    timer(4000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.returnToIntranet());
  }

  returnToIntranet(): void {
    window.location.replace(this.intranetUrl);
  }
}
