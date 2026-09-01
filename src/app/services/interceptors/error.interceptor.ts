import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private toastr = inject(ToastrService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          switch (error.status) {
            case 0:
              this.toastr.error('Impossible de contacter le serveur. Vérifiez votre connexion internet.', 'Erreur Réseau');
              break;
            case 400:
              this.toastr.warning(error.error?.message || 'Requête invalide.', 'Attention (400)');
              break;
            case 401:
              this.toastr.error('Session expirée ou non authentifiée. Veuillez vous reconnecter.', 'Non Autorisé (401)');
              this.router.navigate(['/admin/login']);
              break;
            case 403:
              this.toastr.error('Accès interdit à cette ressource.', 'Accès Refusé (403)');
              break;
            case 404:
              this.toastr.warning('La ressource demandée est introuvable.', 'Introuvable (404)');
              break;
            case 500:
              this.toastr.error('Erreur interne du serveur. Veuillez réessayer plus tard.', 'Erreur Serveur (500)');
              // If fatal on specific endpoint, we can route or notify
              break;
            case 502:
            case 503:
            case 504:
              this.toastr.error('Le service est temporairement indisponible.', 'Service Indisponible (' + error.status + ')');
              break;
            default:
              this.toastr.error('Une erreur inattendue est survenue (' + (error.status || 'Erreur') + ').', 'Erreur');
              break;
          }
        }
        return throwError(() => error);
      })
    );
  }
}
