import { Component } from '@angular/core';
import { FireBaseAuthService } from 'src/app/services/firebaseAuthServices';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {


  constructor(private authService: FireBaseAuthService) {}


  logout() {
    // Implement logic to handle user logout (e.g., call an authentication service)
    this.authService.logout()
  }



}
