import { Component } from '@angular/core';

import { FireBaseAuthService } from 'src/app/services/firebaseService';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private fService : FireBaseAuthService) {}

  showComponentName: string | null = null;


  
  showComponent(componentName: string) {
    this.showComponentName = componentName;
  }

  logout() {
    // Implement logic to handle user logout (e.g., call an authentication service)
    this.fService.logout()
  }
}
