import { Component } from '@angular/core';
import { FireBaseAuthService } from './services/firebaseAuthServices';
import { NavigationEnd, Router } from '@angular/router';
import { inject } from '@vercel/analytics';
import { environment } from '../app/constent/constant';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'portfolio';

  constructor(private translate: TranslateService) {
    inject({ mode: environment.production ? 'production' : 'development' });
    
    // Set default language
    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('fr');

    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|fr/) ? browserLang : 'fr');
  }
}
