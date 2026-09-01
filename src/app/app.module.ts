import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AdminModule } from './admin/admin.module';
import { environment } from '../app/constent/constant';
import { ToastrModule } from 'ngx-toastr';
import { NotFoundComponent } from './not-found/not-found.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './services/interceptors/error.interceptor';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {  getFirestore,provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations'; 
import { NgModule } from '@angular/core';
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { HttpClient, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    PortfolioModule,
    AdminModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fr'
    })
  ],
  providers: [
    provideAnimations(), 
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),
    ToastrModule.forRoot().providers!, 
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()), // Initialize Firebase Analytics
    ScreenTrackingService,
    UserTrackingService,
    provideStorage(() => getStorage()),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}