import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { first } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private router: Router, private viewportScroller: ViewportScroller) { }

  isRouteActive(routePath: string): boolean {
    return this.router.url.includes(routePath);
  }

  scrollToSection(elementId: string) {
    if (!this.isRouteActive("home")) {
      this.router.navigate(['/home'], { fragment: elementId })
      this.router.events.pipe(
        first(evt => evt instanceof NavigationEnd)
      ).subscribe(() => {
        this.viewportScroller.scrollToAnchor(elementId);
      });
    
    } else {
      const element = document.querySelector(`#${elementId}`);
      if (element) {
        this.viewportScroller.scrollToAnchor(elementId);
      }
    }
  }



  
}
