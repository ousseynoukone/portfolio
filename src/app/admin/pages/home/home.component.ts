import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { FireBaseAuthService } from 'src/app/services/firebaseAuthServices';
import { LoadingHandler } from '../../loadingHandler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  showComponentName: string = "projects"
  
  showComponent(componentName: string) {
    this.showComponentName = componentName;
  }



}
