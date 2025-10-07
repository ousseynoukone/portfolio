import { Component } from '@angular/core';
import { FireBaseAuthService } from './services/firebaseAuthServices';
import { NavigationEnd, Router } from '@angular/router';
import { inject } from '@vercel/analytics';
import { environment } from '../app/constent/constant';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'portfolio';

  constructor() {
    inject({ mode: environment.production ? 'production' : 'development' });
  }
}
