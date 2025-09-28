import { Component } from '@angular/core';
import {  ActivatedRoute, Router } from '@angular/router';
import { FireBaseAuthService } from 'src/app/services/firebaseAuthServices';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent {


  constructor(private authService: FireBaseAuthService, private router : Router ) {}


  logout() {
    // Implement logic to handle user logout (e.g., call an authentication service)
    this.authService.logout()
  }

  goToHome(){
    this.router.navigate(['admin'],);
  }

  goToClientView(){
    this.router.navigate([''],);

  }
}
