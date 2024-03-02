import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FireBaseAuthService } from 'src/app/services/firebaseService';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  // isLoading = true;

  constructor(private authService: FireBaseAuthService, private router: Router) {}

  // ngOnInit() {
  //   this.authService.isAuthenticated.subscribe(isAuthenticated => {
  //     if (!isAuthenticated) {
  //       this.router.navigate(['/admin/login']);
  //     }
  //     // Authentication check is complete, hide the loader
  //     this.isLoading = false;
  //   });
  // }
}
