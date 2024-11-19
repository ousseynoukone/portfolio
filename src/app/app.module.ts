import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AdminModule } from './admin/admin.module';
import {environment} from '../app/constent/constant';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ElementRef, NgModule } from '@angular/core';
import { NotFoundComponent } from './not-found/not-found.component';


@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    PortfolioModule,
    AdminModule,
    AngularFireModule.initializeApp(environment.firebase),
    BrowserAnimationsModule, // Required for animations
    ToastrModule.forRoot() ,// Initialize Toastr globally
    AppRoutingModule,


  ],
  providers: [
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
 }

