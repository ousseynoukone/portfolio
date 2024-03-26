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
      this.router.navigate(['/home'])
      this.router.events.pipe(
        first(evt => evt instanceof NavigationEnd)
      ).subscribe(() => {
    setTimeout(() => {
      this.scrollTo(elementId);
    }, 200); // 1000 milliseconds = 1 second

        
      });
    
    } else {
      this.scrollTo(elementId)

    }
  }

  scrollTo(elementId : string){
    const element = document.querySelector(`#${elementId}`);
    if (element) {
      this.viewportScroller.scrollToAnchor(elementId);
    }
  }



  
}
