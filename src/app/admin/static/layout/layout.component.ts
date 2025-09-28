import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FireBaseAuthService } from 'src/app/services/firebaseAuthServices';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css'],
    standalone: false
})
export class LayoutComponent {
  constructor(private authService: FireBaseAuthService, private router: Router) {}

  showComponentName: string = "projects"
  isLoading = true;


  
  showComponent(componentName: string) {
    this.showComponentName = componentName;
  }


  ngOnInit() {
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/admin/login']);
      }
      // Authentication check is complete, hide the loader
      this.isLoading = false;
    });
  }

}
