import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { PassDataThrough } from 'src/app/portfolio/shared/sharedService';

@Injectable()
export class RouteGuard implements CanActivate {
  constructor(private passDataThrough: PassDataThrough, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const shareData = this.passDataThrough.getData;
    const currentRoute = state.url;
    if (shareData === undefined) {
      if (currentRoute.includes("admin")) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
      return false;
    } else {
      return true;
    }
  }
}
