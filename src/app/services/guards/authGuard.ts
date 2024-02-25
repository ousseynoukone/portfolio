// auth.guard.ts
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { FireBaseAuthService } from '../firebaseService';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
  const authService = inject(FireBaseAuthService);
  const router  = inject(Router)
  return authService.isAuthenticated.pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate(["admin/login"])
        return false;
      }
    })
  );
};
