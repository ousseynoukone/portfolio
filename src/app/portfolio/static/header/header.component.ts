import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { first } from 'rxjs';
import { FireBaseCvService, CvData } from '../../../services/firebaseCvService';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent implements OnInit {

  activeSection: string = 'home';
  currentCv: CvData | null = null;

  constructor(
    private router: Router, 
    private viewportScroller: ViewportScroller,
    private cvService: FireBaseCvService
  ) { }

  ngOnInit() {
    this.loadCurrentCv();
  }

  async loadCurrentCv() {
    this.currentCv = await this.cvService.getCurrentCv();
  }

  downloadCv() {
    if (this.currentCv) {
      this.cvService.downloadCv(this.currentCv);
    }
  }

  isRouteActive(routePath: string): boolean {
    return this.router.url.includes(routePath);
  }

  redirectToGithub() {
    window.open('https://github.com/ousseynoukone', '_blank');
  }

  scrollToSection(elementId: string) {
    this.activeSection = elementId;
    
    if (!this.isRouteActive("home")) {
      this.router.navigate(['/home'])
      this.router.events.pipe(
        first(evt => evt instanceof NavigationEnd)
      ).subscribe(() => {
        setTimeout(() => {
          this.scrollTo(elementId);
        }, 150);
      });
    } else {
      this.scrollTo(elementId);
    }
  }

  scrollTo(elementId: string) {
    if (elementId === 'home') {
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(`#${elementId}`);
      if (element) {
        this.viewportScroller.scrollToAnchor(elementId);
      }
    }
  }



  
}

