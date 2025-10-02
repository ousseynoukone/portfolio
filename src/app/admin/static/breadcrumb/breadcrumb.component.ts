import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css'],
  standalone: false
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs();
      });
    
    // Initial load
    this.breadcrumbs = this.createBreadcrumbs();
  }

  private createBreadcrumbs(): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentRoute = this.activatedRoute;
    let url = '/admin';

    // Always start with Admin
    breadcrumbs.push({
      label: 'Admin',
      url: '/admin',
      active: false
    });

    // Navigate through the route tree
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
      const routePath = currentRoute.snapshot.url.map(segment => segment.path).join('/');
      
      if (routePath) {
        url += `/${routePath}`;
        const label = this.getBreadcrumbLabel(currentRoute);
        
        if (label && label !== 'Admin') {
          breadcrumbs.push({
            label: label,
            url: url,
            active: false
          });
        }
      }
    }

    // Mark the last item as active
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].active = true;
    }

    return breadcrumbs;
  }

  private getBreadcrumbLabel(route: ActivatedRoute): string {
    const routeData = route.snapshot.data;
    
    // Check for custom breadcrumb label in route data
    if (routeData && routeData['breadcrumb']) {
      return routeData['breadcrumb'];
    }

    // Default labels based on route path
    const path = route.snapshot.url[0]?.path;
    switch (path) {
      case '':
        return 'Dashboard';
      case 'projects':
        return 'Projets';
      case 'abilities':
        return 'Compétences';
      case 'order-images':
        return 'Ordre des Images';
      case 'order-projects':
        return 'Ordre des Projets';
      default:
        return path ? path.charAt(0).toUpperCase() + path.slice(1) : '';
    }
  }

  navigateTo(url: string) {
    if (url) {
      this.router.navigate([url]);
    }
  }

  isFontAwesomeLoaded(): boolean {
    // Check if Font Awesome is loaded by testing if the CSS class exists
    const testElement = document.createElement('i');
    testElement.className = 'fas fa-home';
    const computedStyle = window.getComputedStyle(testElement);
    return computedStyle.fontFamily.includes('Font Awesome') || computedStyle.fontFamily.includes('FontAwesome');
  }
}
