import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { FireBaseAuthService } from 'src/app/services/firebaseService';
import { LoadingHandler } from '../../loadingHandler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private authService: FireBaseAuthService, private router: Router) {}

  showComponentName: string = "projects"
  isLoading = true;


  
  showComponent(componentName: string) {
    this.showComponentName = componentName;
  }

  logout() {
    // Implement logic to handle user logout (e.g., call an authentication service)
    this.authService.logout()
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
