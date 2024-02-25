import { Component, OnInit } from '@angular/core';
import { FireBaseAuthService } from './services/firebaseService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'portfolio';

  constructor(private authService: FireBaseAuthService, private router: Router) {
  }

  ngOnInit() {
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/admin/login']); 
      }
    });
  }
}
