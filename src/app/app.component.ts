import { Component } from '@angular/core';
import { FireBaseAuthService } from './services/firebaseService';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'portfolio';
  // isLoading = true;

  // constructor(private authService: FireBaseAuthService, private router: Router) {}

  // ngOnInit() {
  //   this.authService.isAuthenticated.subscribe(isAuthenticated => {
  //     if (!isAuthenticated) {
  //       this.router.navigate(['/admin/login']);
  //     }
  //     // Authentication check is complete, hide the loader
  //     this.isLoading = false;
  //   });
  // }


  // constructor(private router: Router) { } 
      
  // ngOnInit() { 
  //     this.router.events.subscribe((event) => { 
  //         if (!(event instanceof NavigationEnd)) { 
  //             return; 
  //         } 
  //         window.scrollTo(0, 0) 
  //     }); 
  // } 
}
